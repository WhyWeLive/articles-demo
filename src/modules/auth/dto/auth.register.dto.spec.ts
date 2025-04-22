import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthRegisterDTO } from './auth.register.dto';

describe('AuthRegisterDTO', () => {
  it('should be defined', () => {
    const dto = new AuthRegisterDTO();
    expect(dto).toBeDefined();
  });

  it('should validate a valid DTO', async () => {
    const dto = plainToInstance(AuthRegisterDTO, {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should transform email to lowercase', async () => {
    const dto = plainToInstance(AuthRegisterDTO, {
      email: 'TEST@EXAMPLE.COM',
      name: 'Test User',
      password: 'password123',
    });

    expect(dto.email).toBe('test@example.com');
  });

  it('should validate email is required', async () => {
    const dto = plainToInstance(AuthRegisterDTO, {
      name: 'Test User',
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('should validate email format', async () => {
    const dto = plainToInstance(AuthRegisterDTO, {
      email: 'not-an-email',
      name: 'Test User',
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should validate name is required', async () => {
    const dto = plainToInstance(AuthRegisterDTO, {
      email: 'test@example.com',
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('should validate name is a string', async () => {
    const dto = plainToInstance(AuthRegisterDTO, {
      email: 'test@example.com',
      name: 123, // Not a string
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should validate password is required', async () => {
    const dto = plainToInstance(AuthRegisterDTO, {
      email: 'test@example.com',
      name: 'Test User',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('should validate password is a string', async () => {
    const dto = plainToInstance(AuthRegisterDTO, {
      email: 'test@example.com',
      name: 'Test User',
      password: 123, // Not a string
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should not allow id property', async () => {
    const dto = plainToInstance(
      AuthRegisterDTO,
      {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
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
      AuthRegisterDTO,
      {
        email: 'test@example.com',
        name: 'Test User',
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
