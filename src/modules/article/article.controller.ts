import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginationRequestDTO } from '@common/dto/pagination.request.dto';
import { PaginationResponseDTO } from '@common/dto/pagination.response.dto';
import { ArticleItemDTO } from '@modules/article/dto/article.item.dto';
import { PaginatedResponse } from '@common/decorator/pagination.decorator';
import { ArticleIDDTO } from '@modules/article/dto/article.id.dto';
import { ArticleCreateDTO } from '@modules/article/dto/article.create.dto';
import { ArticleUpdateDTO } from '@modules/article/dto/article.update.dto';
import { ArticleService } from '@modules/article/article.service';
import { AuthGuard } from '@modules/auth/auth.guard';
import { User } from '@modules/auth/decorator/user.decorator';
import { AuthUserItemDTO } from '@modules/auth/dto/auth.user-item.dto';
import { UseCache } from '@common/decorator/cache.use.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Article controller.
 */
@Controller('/articles/')
export class ArticleController {
  constructor(private readonly service: ArticleService) {}

  /**
   * Get all articles.
   *
   * @throws {400} Bad request.
   * @throws {500} Internal server error.
   *
   */
  @Get()
  @PaginatedResponse(ArticleItemDTO)
  @UseCache({
    queryParams: ['page', 'limit', 'search'],
  })
  public async findAll(
    @Query() query: PaginationRequestDTO,
  ): Promise<PaginationResponseDTO<ArticleItemDTO>> {
    const [items, count] = await this.service.findAll(
      query.page,
      query.limit,
      query.search,
    );

    return new PaginationResponseDTO(items, count, query.page, query.limit);
  }

  /**
   * Get one article.
   *
   * @throws {400} Bad request.
   * @throws {404} Not found.
   * @throws {500} Internal server error.
   *
   */
  @UseCache()
  @Get('/:id/')
  public async findOne(@Param() query: ArticleIDDTO): Promise<ArticleItemDTO> {
    if (!(await this.service.exists(query.id))) {
      throw new NotFoundException('Article not found');
    }

    return this.service.findOne(query.id);
  }

  /**
   * Create a new article.
   *
   * @throws {400} Bad request.
   * @throws {401} Unauthorized.
   * @throws {500} Internal server error.
   */
  @ApiBearerAuth()
  @UseCache()
  @UseGuards(AuthGuard)
  @Post()
  public async create(
    @User() user: AuthUserItemDTO,
    @Body() body: ArticleCreateDTO,
  ): Promise<ArticleItemDTO> {
    return this.service.create(user.id, body);
  }

  /**
   * Updates an article using the provided article ID and details.
   *
   * @throws {400} Bad request.
   * @throws {401} Unauthorized.
   * @throws {404} Not found.
   * @throws {500} Internal server error.
   */
  @ApiBearerAuth()
  @UseCache()
  @UseGuards(AuthGuard)
  @Put('/:id/')
  public async update(
    @User() user: AuthUserItemDTO,
    @Param() query: ArticleIDDTO,
    @Body() body: ArticleCreateDTO,
  ): Promise<ArticleItemDTO> {
    return this.service.patch(user.id, query.id, body);
  }

  /**
   * Partially updates an article using the provided article ID and details.
   *
   * @throws {400} Bad request.
   * @throws {401} Unauthorized.
   * @throws {404} Not found.
   * @throws {500} Internal server error.
   */
  @ApiBearerAuth()
  @UseCache()
  @UseGuards(AuthGuard)
  @Patch('/:id/')
  public async patch(
    @User() user: AuthUserItemDTO,
    @Param() query: ArticleIDDTO,
    @Body() body: ArticleUpdateDTO,
  ): Promise<ArticleItemDTO> {
    return this.service.patch(user.id, query.id, body);
  }

  /**
   * Deletes an article using the provided article ID.
   *
   * @throws {400} Bad request.
   * @throws {401} Unauthorized.
   * @throws {404} Not found.
   * @throws {500} Internal server error.
   */
  @ApiBearerAuth()
  @UseCache()
  @UseGuards(AuthGuard)
  @Delete('/:id/')
  public async delete(
    @User() user: AuthUserItemDTO,
    @Param() query: ArticleIDDTO,
  ): Promise<ArticleItemDTO> {
    return this.service.delete(user.id, query.id);
  }
}
