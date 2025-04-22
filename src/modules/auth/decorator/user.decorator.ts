import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserItemDTO } from '@modules/auth/dto/auth.user-item.dto';

/**
 * Decorator to get the user from the request.
 */
export const User = createParamDecorator(
  (
    data: keyof AuthUserItemDTO,
    ctx: ExecutionContext,
  ): AuthUserItemDTO | Partial<AuthUserItemDTO> => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
