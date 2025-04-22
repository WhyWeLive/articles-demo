import { Module } from '@nestjs/common';

import { ArticleController } from '@modules/article/article.controller';
import { ArticleService } from '@modules/article/article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '@common/entities/article.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { ConfigValuesType } from '@common/enum/config.values.type';
import { RedisModule, RedisService } from '@liaoliaots/nestjs-redis';
import KeyvValkey from '@keyv/valkey';
import { Redis } from 'iovalkey';

@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        config: {
          host: config.get<string>(ConfigValuesType.REDIS_HOST),
          port: config.get<number>(ConfigValuesType.REDIS_PORT),
        },
      }),
    }),

    CacheModule.registerAsync({
      inject: [ConfigService, RedisService],
      useFactory: (config: ConfigService, redis: RedisService) => ({
        isGlobal: true,

        stores: [new KeyvValkey(redis.getOrThrow() as unknown as Redis)],

        ttl: config.get<number>(ConfigValuesType.CACHE_REDIS_TTL) * 60 * 1000,
        namespace: config.get<string>(ConfigValuesType.CACHE_REDIS_NAMESPACE),
      }),
    }),

    TypeOrmModule.forFeature([ArticleEntity]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
