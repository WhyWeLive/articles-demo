import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { AuthRegisterDTO } from './dto/auth.register.dto';
import { AuthLoginDTO } from './dto/auth.login.dto';

// Mock UserEntity class
class UserEntity {
  id: number;
  name: string;
  email: string;
  password: string;
}

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let queryBuilderMock: any;

  beforeEach(() => {
    // Create a mock for the query builder with all the methods used in the service
    queryBuilderMock = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getExists: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest.fn(),
      then: jest.fn(),
    };
  });

  const mockRepository = () => ({
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
  });

  const mockJwtService = () => ({
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useFactory: mockRepository,
        },
        {
          provide: JwtService,
          useFactory: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('current', () => {
    it('should return user when token is valid', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const mockToken = 'valid.jwt.token';

      jwtService.verifyAsync.mockResolvedValue({ id: 1 });
      queryBuilderMock.getOne.mockResolvedValue(mockUser as UserEntity);

      const result = await service.current(mockToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken);
      expect(queryBuilderMock.where).toHaveBeenCalledWith('user.id = :id', {
        id: 1,
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when token verification fails', async () => {
      const mockToken = 'invalid.jwt.token';

      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      const result = await service.current(mockToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken);
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      const registerDto: AuthRegisterDTO = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      queryBuilderMock.getExists.mockResolvedValue(false);
      queryBuilderMock.execute.mockResolvedValue({
        identifiers: [{ id: 1 }],
      });

      // Mock the then method for the execute chain
      queryBuilderMock.then.mockImplementation((callback) => {
        return Promise.resolve(callback({ identifiers: [{ id: 1 }] }));
      });

      jwtService.signAsync.mockResolvedValue('new.jwt.token');

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashed_password'));

      const result = await service.register(registerDto);

      expect(queryBuilderMock.getExists).toHaveBeenCalled();
      expect(queryBuilderMock.values).toHaveBeenCalledWith({
        name: registerDto.name,
        email: registerDto.email,
        password: 'hashed_password',
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({ token: 'new.jwt.token' });
    });

    it('should throw ConflictException when user already exists', async () => {
      const registerDto: AuthRegisterDTO = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      };

      queryBuilderMock.getExists.mockResolvedValue(true);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(queryBuilderMock.getExists).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return a token when credentials are valid', async () => {
      const loginDto: AuthLoginDTO = {
        email: 'user@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: 'user@example.com',
        password: 'hashed_password',
      };

      queryBuilderMock.getOne.mockResolvedValue(mockUser as UserEntity);
      jwtService.signAsync.mockResolvedValue('login.jwt.token');

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.login(loginDto);

      expect(queryBuilderMock.getOne).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({ id: mockUser.id });
      expect(result).toEqual({ token: 'login.jwt.token' });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const loginDto: AuthLoginDTO = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      queryBuilderMock.getOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(queryBuilderMock.getOne).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const loginDto: AuthLoginDTO = {
        email: 'user@example.com',
        password: 'wrong_password',
      };

      const mockUser = {
        id: 1,
        email: 'user@example.com',
        password: 'hashed_password',
      };

      queryBuilderMock.getOne.mockResolvedValue(mockUser as UserEntity);

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(queryBuilderMock.getOne).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });
  });
});
