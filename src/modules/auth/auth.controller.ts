import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthUserItemDTO } from '@modules/auth/dto/auth.user-item.dto';
import { AuthRegisterDTO } from '@modules/auth/dto/auth.register.dto';
import { AuthLoginDTO } from '@modules/auth/dto/auth.login.dto';
import { AuthService } from '@modules/auth/auth.service';
import { AuthTokenDTO } from '@modules/auth/dto/auth.token.dto';
import { User } from '@modules/auth/decorator/user.decorator';
import { AuthGuard } from '@modules/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('/authentication/')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  /**
   * Gets the current user.
   *
   * @throws {401} Unauthorized.
   * @throws {500} Internal server error.
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/current/')
  public async current(
    @User() user: AuthUserItemDTO,
  ): Promise<AuthUserItemDTO> {
    return user;
  }

  /**
   * Registers a new user.
   *
   * @throws {409} User with provided email already registered.
   * @throws {500} Internal server error.
   */
  @Post('/register/')
  public async register(@Body() body: AuthRegisterDTO): Promise<AuthTokenDTO> {
    return this.service.register(body);
  }

  /**
   * Logs in a user.
   *
   * @throws {401} Invalid credentials.
   * @throws {500} Internal server error.
   */
  @Post('/login/')
  public async login(@Body() body: AuthLoginDTO): Promise<AuthTokenDTO> {
    return this.service.login(body);
  }
}
