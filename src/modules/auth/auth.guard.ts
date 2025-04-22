import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '@modules/auth/auth.service';

/**
 * Auth guard.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly service: AuthService) {}

  /**
   * Checks if the user is authenticated.
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return false;
    }

    try {
      const user = await this.service.current(token);

      if (!user) {
        return false;
      }

      request['user'] = user;

      return true;
    } catch {
      return false;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
