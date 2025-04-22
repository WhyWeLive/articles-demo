import { PickType } from '@nestjs/swagger';
import { AuthUserItemDTO } from '@modules/auth/dto/auth.user-item.dto';

export class AuthUserPublicDTO extends PickType(AuthUserItemDTO, [
  'id',
  'name',
] as const) {}
