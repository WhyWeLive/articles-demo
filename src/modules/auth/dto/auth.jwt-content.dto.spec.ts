import { plainToInstance } from 'class-transformer';
import { AuthJwtContentDTO } from './auth.jwt-content.dto';

describe('AuthJwtContentDTO', () => {
  it('should be defined', () => {
    const dto = new AuthJwtContentDTO();
    expect(dto).toBeDefined();
  });

  it('should include id property', () => {
    const dto = plainToInstance(AuthJwtContentDTO, {
      id: 1,
    });

    expect(dto.id).toBe(1);
  });

  it('should not include email property', () => {
    const dto = plainToInstance(
      AuthJwtContentDTO,
      {
        id: 1,
        email: 'test@example.com',
      },
      {
        excludeExtraneousValues: true,
      },
    );

    expect(dto).not.toHaveProperty('email');
  });

  it('should not include name property', () => {
    const dto = plainToInstance(
      AuthJwtContentDTO,
      {
        id: 1,
        name: 'Test User',
      },
      {
        excludeExtraneousValues: true,
      },
    );

    expect(dto).not.toHaveProperty('name');
  });

  it('should not include createdAt property', () => {
    const dto = plainToInstance(
      AuthJwtContentDTO,
      {
        id: 1,
        createdAt: new Date(),
      },
      {
        excludeExtraneousValues: true,
      },
    );

    expect(dto).not.toHaveProperty('createdAt');
  });

  it('should allow id to be undefined', () => {
    const dto = plainToInstance(AuthJwtContentDTO, {});

    expect(dto.id).toBeUndefined();
  });
});
