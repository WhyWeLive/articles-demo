import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Pagination request.
 */
export class PaginationRequestDTO {
  /**
   * Page number.
   */
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Type(() => Number)
  public readonly page: number = 0;

  /**
   * Number of items per page.
   */
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Type(() => Number)
  public readonly limit: number = 10;

  /**
   * Search term.
   */
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  public readonly search?: string;
}
