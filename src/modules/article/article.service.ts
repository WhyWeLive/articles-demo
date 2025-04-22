import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ArticleEntity } from '@common/entities/article.entity';
import { ArticleCreateDTO } from '@modules/article/dto/article.create.dto';
import { ArticleUpdateDTO } from '@modules/article/dto/article.update.dto';
import { ArticleItemDTO } from '@modules/article/dto/article.item.dto';

/**
 * Article service.
 */
@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly repository: Repository<ArticleEntity>,
  ) {}

  /**
   * Checks if an article exists using the provided article ID.
   *
   * @param executorId {number} ID of the executor.
   * @param id         {number} ID of the article.
   */
  public async exists(id: number, executorId?: number): Promise<boolean> {
    return this.repository
      .createQueryBuilder('article')
      .where((builder) => {
        builder.where('article.id = :id', { id });

        if (executorId) {
          builder.andWhere('article.authorId = :executorId', { executorId });
        }
      })
      .getExists();
  }

  /**
   * Gets all articles.
   *
   * @param page   {number} Page number.
   * @param limit  {number} Number of items per page.
   * @param search {string} Search term.
   */
  public async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<[ArticleItemDTO[], number]> {
    const builder = this.repository
      .createQueryBuilder('article')
      .select()
      .addSelect(['author.id', 'author.name'])
      .leftJoin('article.author', 'author');

    if (search) {
      builder
        .where(
          new Brackets((builder) =>
            builder
              .where('article.title LIKE :search', {
                search: `%${search}%`,
              })
              .orWhere('article.description LIKE :search', {
                search: `%${search}%`,
              }),
          ),
        )
        .setParameter('search', `%${search}%`);
    }

    return builder
      .limit(limit)
      .offset(page * limit)
      .getManyAndCount();
  }

  /**
   * Gets an article using the provided article ID.
   *
   * @param id {number} ID of the article.
   */
  public async findOne(id: number): Promise<ArticleItemDTO> {
    return this.repository
      .createQueryBuilder('article')
      .addSelect(['author.id', 'author.name'])
      .leftJoin('article.author', 'author')
      .where('article.id = :id', { id })
      .getOne();
  }

  /**
   * Creates a new article.
   *
   * @param executorId {number}           ID of the executor.
   * @param article    {ArticleCreateDTO} Article details.
   */
  public async create(
    executorId: number,
    article: ArticleCreateDTO,
  ): Promise<ArticleItemDTO> {
    return this.repository
      .createQueryBuilder()
      .insert()
      .values({
        title: article.title,
        description: article.description,

        authorId: executorId,
      })
      .execute()
      .then((result) => result.identifiers[0].id as number)
      .then((id) => this.findOne(id));
  }

  /**
   * Updates an article using the provided article ID and details.
   *
   * @param executorId {number}           ID of the executor.
   * @param id         {number}           ID of the article.
   * @param article    {ArticleUpdateDTO} Article details.
   */
  public async patch(
    executorId: number,
    id: number,
    article: ArticleUpdateDTO,
  ): Promise<ArticleItemDTO> {
    if (!(await this.exists(id, executorId))) {
      throw new NotFoundException('Article not found');
    }

    await this.repository
      .createQueryBuilder()
      .update()
      .set({
        ...(article.title ? { title: article.title } : {}),
        ...(article.description ? { description: article.description } : {}),
      })
      .where('id = :id', { id })
      .andWhere('authorId = :executorId', { executorId })
      .execute();

    return this.findOne(id);
  }

  /**
   * Deletes an article using the provided article ID.
   *
   * @param executorId {number} ID of the executor.
   * @param id         {number} ID of the article.
   */
  public async delete(executorId: number, id: number): Promise<ArticleItemDTO> {
    if (!(await this.exists(id, executorId))) {
      throw new NotFoundException('Article not found');
    }

    const entity = await this.findOne(id);

    await this.repository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute();

    return entity;
  }
}
