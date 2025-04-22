import { plainToInstance } from 'class-transformer';
import { AuthUserPublicDTO } from './auth.user-public.dto';

describe('AuthUserPublicDTO', () => {
  it('should be defined', () => {
    const dto = new AuthUserPublicDTO();
    expect(dto).toBeDefined();
  });

  it('should include name property', () => {
    const dto = plainToInstance(AuthUserPublicDTO, {
      id: 1,
      name: 'Test User',
    });

    expect(dto.name).toBe('Test User');
  });

  it('should not include email property', () => {
    const dto = plainToInstance(
      AuthUserPublicDTO,
      {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      },
      {
        excludeExtraneousValues: true,
      },
    );

    expect(dto).not.toHaveProperty('email');
  });

  it('should not include createdAt property', () => {
    const dto = plainToInstance(
      AuthUserPublicDTO,
      {
        id: 1,
        name: 'Test User',
        createdAt: new Date(),
      },
      {
        excludeExtraneousValues: true,
      },
    );

    expect(dto).not.toHaveProperty('createdAt');
  });

  it('should allow id to be undefined', () => {
    const dto = plainToInstance(AuthUserPublicDTO, {
      name: 'Test User',
    });

    expect(dto.id).toBeUndefined();
    expect(dto.name).toBe('Test User');
  });

  it('should allow name to be undefined', () => {
    const dto = plainToInstance(AuthUserPublicDTO, {
      id: 1,
    });

    expect(dto.id).toBe(1);
    expect(dto.name).toBeUndefined();
  });

  it('should allow both id and name to be undefined', () => {
    const dto = plainToInstance(AuthUserPublicDTO, {});

    expect(dto.id).toBeUndefined();
    expect(dto.name).toBeUndefined();
  });
});
