import { IsDefined, IsString, MaxLength, MinLength } from 'class-validator';
import { AuthUserPublicDTO } from '@modules/auth/dto/auth.user-public.dto';

export class ArticleItemDTO {
  /**
   * Unique identifier of the article.
   *
   * @example 1
   */
  public readonly id: number;

  /**
   * Title of the article.
   *
   * @example Hello World!
   */
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(50, { message: 'Title must be at most 50 characters long' })
  @IsString({ message: 'Title must be a string', always: true })
  @IsDefined({ message: 'Title is required' })
  public readonly title: string;

  /**
   * Description of the article.
   *
   * @example This is a sample article.
   */
  @MinLength(3, { message: 'Description must be at least 3 characters long' })
  @MaxLength(500, {
    message: 'Description must be at most 500 characters long',
  })
  @IsString({ message: 'Description must be a string' })
  @IsDefined({ message: 'Description is required' })
  public readonly description: string;

  /**
   * Author of the article.
   */
  public readonly author: AuthUserPublicDTO;

  /**
   * Date of the article's creation.
   */
  public readonly createdAt: Date;
}
