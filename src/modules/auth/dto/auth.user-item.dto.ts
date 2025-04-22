import { IsDefined, IsEmail, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthUserItemDTO {
  /**
   * ID of the user.
   *
   * @example 1
   */
  @IsDefined({ message: 'ID is required' })
  @IsNumber({}, { message: 'ID must be a number' })
  public readonly id: number;

  /**
   * Email of the user.
   *
   * @example hello@whywelive.me
   */
  @IsDefined({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Transform(({ value }) => value.toLowerCase())
  public readonly email: string;

  /**
   * Name of the user.
   *
   * @example Nikita
   */
  @IsDefined({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  public readonly name: string;

  /**
   * Date of the user's creation.
   */
  @IsDefined({ message: 'Date is required' })
  public readonly createdAt: Date;
}
