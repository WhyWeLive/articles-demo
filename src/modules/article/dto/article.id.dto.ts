import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ArticleIDDTO {
  /**
   * Article ID.
   */
  @IsNumber({}, { message: 'Article ID must be a number' })
  @Type(() => Number)
  public readonly id: number;
}
