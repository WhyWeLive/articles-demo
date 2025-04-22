import { PickType } from '@nestjs/swagger';
import { AuthUserItemDTO } from '@modules/auth/dto/auth.user-item.dto';
import { IsDefined, IsString } from 'class-validator';

export class AuthRegisterDTO extends PickType(AuthUserItemDTO, [
  'email',
  'name',
] as const) {
  /**
   * Password of the user.
   *
   * @example password
   */
  @IsDefined({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  public readonly password: string;
}
