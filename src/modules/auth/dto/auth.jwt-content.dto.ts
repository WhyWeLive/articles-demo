import { PickType } from '@nestjs/swagger';
import { AuthUserItemDTO } from '@modules/auth/dto/auth.user-item.dto';

export class AuthJwtContentDTO extends PickType(AuthUserItemDTO, [
  'id',
] as const) {}
