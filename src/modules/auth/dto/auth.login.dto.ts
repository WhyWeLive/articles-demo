import { PickType } from '@nestjs/swagger';
import { AuthRegisterDTO } from '@modules/auth/dto/auth.register.dto';

export class AuthLoginDTO extends PickType(AuthRegisterDTO, [
  'email',
  'password',
] as const) {}
