import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthUserItemDTO } from './auth.user-item.dto';

describe('AuthUserItemDTO', () => {
  it('should be defined', () => {
    const dto = new AuthUserItemDTO();
    expect(dto).toBeDefined();
  });

  it('should validate a valid DTO', async () => {
    const dto = plainToInstance(AuthUserItemDTO, {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date(),
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should transform email to lowercase', async () => {
    const dto = plainToInstance(AuthUserItemDTO, {
      email: 'TEST@EXAMPLE.COM',
      name: 'Test User',
    });

    expect(dto.email).toBe('test@example.com');
  });

  it('should validate email is required', async () => {
    const dto = plainToInstance(AuthUserItemDTO, {
      name: 'Test User',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('should validate email format', async () => {
    const dto = plainToInstance(AuthUserItemDTO, {
      id: 1,
      email: 'not-an-email',
      name: 'Test User',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should validate name is required', async () => {
    const dto = plainToInstance(AuthUserItemDTO, {
      email: 'test@example.com',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('should validate name is a string', async () => {
    const dto = plainToInstance(AuthUserItemDTO, {
      id: 1,
      email: 'test@example.com',
      name: 123, // Not a string
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
