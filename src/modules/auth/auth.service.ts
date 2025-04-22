import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

import { UserEntity } from '@common/entities/user.entity';
import { AuthUserItemDTO } from '@modules/auth/dto/auth.user-item.dto';
import { AuthRegisterDTO } from '@modules/auth/dto/auth.register.dto';
import { AuthTokenDTO } from '@modules/auth/dto/auth.token.dto';
import { AuthJwtContentDTO } from '@modules/auth/dto/auth.jwt-content.dto';
import { AuthLoginDTO } from '@modules/auth/dto/auth.login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Gets the current user using the provided JWT token.
   *
   * @param token {string} JWT token
   */
  public async current(token: string): Promise<AuthUserItemDTO | null> {
    try {
      const { id } = await this.jwt.verifyAsync<AuthJwtContentDTO>(token);

      return this.repository
        .createQueryBuilder('user')
        .select(['user.id', 'user.email', 'user.name', 'user.createdAt'])
        .where('user.id = :id', { id })
        .getOne();
    } catch {
      return null;
    }
  }

  /**
   * Registers a new user.
   *
   * @param body {AuthRegisterDTO} User details.
   */
  public async register(body: AuthRegisterDTO): Promise<AuthTokenDTO> {
    const { name, email, password } = body;

    const exists = await this.repository
      .createQueryBuilder()
      .select()
      .where('email = :email', { email })
      .getExists();

    if (exists) {
      throw new ConflictException('User already registered');
    }

    const id = await this.repository
      .createQueryBuilder()
      .insert()
      .values({ name, email, password: await bcrypt.hash(password, 10) })
      .execute()
      .then((result) => result.identifiers[0].id as number);

    return {
      token: await this.jwt.signAsync({ id }),
    };
  }

  public async login(body: AuthLoginDTO): Promise<AuthTokenDTO> {
    const { email, password } = body;

    const user = await this.repository
      .createQueryBuilder()
      .select()
      .where('email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: await this.jwt.signAsync({ id: user.id }),
    };
  }
}
