import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '@common/entities/user.entity';

/**
 * Article entity.
 */
@Entity('articles')
export class ArticleEntity {
  /**
   * Unique identifier of the article.
   */
  @PrimaryGeneratedColumn()
  public readonly id: number;

  /**
   * Title of the article.
   */
  @Column()
  public readonly title: string;

  /**
   * Description of the article.
   */
  @Column()
  public readonly description: string;

  /**
   * Author of the article.
   */
  @Column()
  public readonly authorId: number;

  /**
   * Date of the article's creation.
   */
  @CreateDateColumn()
  public readonly createdAt: Date;

  /**
   * Author of the article.
   */
  @ManyToOne(() => UserEntity)
  public readonly author: UserEntity;
}
