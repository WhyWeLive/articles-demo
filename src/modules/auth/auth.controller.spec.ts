import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthUserItemDTO } from './dto/auth.user-item.dto';
import { AuthRegisterDTO } from './dto/auth.register.dto';
import { AuthLoginDTO } from './dto/auth.login.dto';
import { AuthTokenDTO } from './dto/auth.token.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('current', () => {
    it('should return the current user', async () => {
      const user: AuthUserItemDTO = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      const result = await controller.current(user);

      expect(result).toEqual(user);
    });
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      const registerDto: AuthRegisterDTO = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };
      const mockToken: AuthTokenDTO = {
        token: 'jwt-token',
      };

      mockAuthService.register.mockResolvedValue(mockToken);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockToken);
    });

    it('should pass through ConflictException when user already exists', async () => {
      const registerDto: AuthRegisterDTO = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      };

      const conflictError = new ConflictException('User already registered');
      mockAuthService.register.mockRejectedValue(conflictError);

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      const loginDto: AuthLoginDTO = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockToken: AuthTokenDTO = {
        token: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(mockToken);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockToken);
    });

    it('should pass through UnauthorizedException for invalid credentials', async () => {
      const loginDto: AuthLoginDTO = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      const authError = new UnauthorizedException('Invalid credentials');
      mockAuthService.login.mockRejectedValue(authError);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
