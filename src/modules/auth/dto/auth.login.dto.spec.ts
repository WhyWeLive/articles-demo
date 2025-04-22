import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthLoginDTO } from './auth.login.dto';

describe('AuthLoginDTO', () => {
  it('should be defined', () => {
    const dto = new AuthLoginDTO();
    expect(dto).toBeDefined();
  });

  it('should transform email to lowercase', async () => {
    const dto = plainToInstance(AuthLoginDTO, {
      email: 'TEST@EXAMPLE.COM',
      password: 'password123',
    });

    expect(dto.email).toBe('test@example.com');
  });

  it('should validate email is required', async () => {
    const dto = plainToInstance(AuthLoginDTO, {
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('should validate email format', async () => {
    const dto = plainToInstance(AuthLoginDTO, {
      email: 'not-an-email',
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should validate password is required', async () => {
    const dto = plainToInstance(AuthLoginDTO, {
      email: 'test@example.com',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('should validate password is a string', async () => {
    const dto = plainToInstance(AuthLoginDTO, {
      email: 'test@example.com',
      password: 123, // Not a string
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should not allow name property', async () => {
    const dto = plainToInstance(
      AuthLoginDTO,
      {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      },
      {
        excludeExtraneousValues: true,
      },
    );

    // name should not be part of the DTO since it's not picked
    expect(dto).not.toHaveProperty('name');
  });

  it('should not allow id property', async () => {
    const dto = plainToInstance(
      AuthLoginDTO,
      {
        id: 1,
        email: 'test@example.com',
        password: 'password123',
      },
      {
        excludeExtraneousValues: true,
      },
    );

    // id should not be part of the DTO since it's not picked
    expect(dto).not.toHaveProperty('id');
  });

  it('should not allow createdAt property', async () => {
    const dto = plainToInstance(
      AuthLoginDTO,
      {
        email: 'test@example.com',
        password: 'password123',
        createdAt: new Date(),
      },
      {
        excludeExtraneousValues: true,
      },
    );

    // createdAt should not be part of the DTO since it's not picked
    expect(dto).not.toHaveProperty('createdAt');
  });
});
