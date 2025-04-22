import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * User entity.
 */
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number;

  /**
   * Email of the user.
   */
  @Column()
  public readonly email: string;

  /**
   * Name of the user.
   */
  @Column()
  public readonly name: string;

  /**
   * Password of the user.
   */
  @Column()
  public readonly password: string;

  /**
   * Date of the user's creation.
   */
  @CreateDateColumn()
  public readonly createdAt: Date;
}
