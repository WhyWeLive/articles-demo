import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigValuesType } from '@common/enum/config.values.type';
import { AuthService } from '@modules/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@common/entities/user.entity';
import { AuthController } from '@modules/auth/auth.controller';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(ConfigValuesType.JWT_SECRET),
        signOptions: {
          expiresIn: config.get<number>(ConfigValuesType.JWT_EXPIRES_IN),
        },
      }),
    }),

    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
