import { AuthTokenDTO } from './auth.token.dto';
import { plainToInstance } from 'class-transformer';

describe('AuthTokenDTO', () => {
  it('should be defined', () => {
    const dto = new AuthTokenDTO();
    expect(dto).toBeDefined();
  });

  it('should set token property', () => {
    const token = 'jwt-token-example';
    const dto = plainToInstance(AuthTokenDTO, {
      token,
    });

    expect(dto.token).toBe(token);
  });

  it('should create with token property', () => {
    const token = 'jwt-token-example';
    const dto = { token } as AuthTokenDTO;

    expect(dto.token).toBe(token);
  });

  it('should work with empty token', () => {
    const dto = plainToInstance(AuthTokenDTO, {
      token: '',
    });

    expect(dto.token).toBe('');
  });

  it('should allow token to be undefined', () => {
    const dto = new AuthTokenDTO();

    expect(dto.token).toBeUndefined();
  });
});
