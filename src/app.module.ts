import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Joi from 'joi';

import { AuthModule } from '@modules/auth/auth.module';
import { ArticleModule } from '@modules/article/article.module';
import { ConfigValuesType } from '@common/enum/config.values.type';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,

      validationSchema: Joi.object({
        // Application configuration
        [ConfigValuesType.NODE_ENV]: Joi.string()
          .valid('development', 'production', 'test')
          .required(),

        // Database configuration
        [ConfigValuesType.DATABASE_HOST]: Joi.string().required(),
        [ConfigValuesType.DATABASE_PORT]: Joi.number().required().port(),
        [ConfigValuesType.DATABASE_USER]: Joi.string().required(),
        [ConfigValuesType.DATABASE_PASS]: Joi.string().required(),
        [ConfigValuesType.DATABASE_NAME]: Joi.string().required(),

        // Redis configuration
        [ConfigValuesType.REDIS_HOST]: Joi.string().required(),
        [ConfigValuesType.REDIS_PORT]: Joi.number().required().port(),

        // Cache configuration
        [ConfigValuesType.CACHE_REDIS_DATABASE]: Joi.number().required(),
        [ConfigValuesType.CACHE_REDIS_NAMESPACE]: Joi.string().required(),
        [ConfigValuesType.CACHE_REDIS_TTL]: Joi.number().required(),
        [ConfigValuesType.CACHE_MEMORY_TTL]: Joi.number().required(),
        [ConfigValuesType.CACHE_MEMORY_LRU]: Joi.number().required(),

        // JWT configuration
        [ConfigValuesType.JWT_SECRET]: Joi.string().required(),
        [ConfigValuesType.JWT_EXPIRES_IN]: Joi.number().required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>(ConfigValuesType.DATABASE_HOST),
        port: config.get<number>(ConfigValuesType.DATABASE_PORT),
        username: config.get<string>(ConfigValuesType.DATABASE_USER),
        password: config.get<string>(ConfigValuesType.DATABASE_PASS),
        database: config.get<string>(ConfigValuesType.DATABASE_NAME),
        synchronize: false,
        autoLoadEntities: true,
        migrations: [__dirname + '/common/migrations/*.{ts,js}'],
        migrationsRun: true,
        logging: ['error'],
      }),
    }),

    AuthModule,
    ArticleModule,
  ],
})
export class AppModule {}
