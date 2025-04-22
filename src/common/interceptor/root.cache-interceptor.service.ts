import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { ConfigValuesType } from '@common/enum/config.values.type';

export const CACHE_OPTIONS_METADATA = 'cache_options_metadata';

@Injectable()
export class RootCacheInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(RootCacheInterceptor.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Generate the cache key based on URL and specified query parameters
    let cacheKey = context.getClass().name;

    if (
      request.method.toUpperCase() === 'GET' &&
      request.query.page &&
      request.query.limit
    ) {
      cacheKey = `paginated:${cacheKey}:page-${request.query.page}:limit-${request.query.limit}${request.query.search ? ':search-' + request.query.search : ''}`;
    }

    if (request.params['id']) {
      cacheKey = `single:${cacheKey}:${request.params['id']}`;
    }

    // Clear cache if requested
    if (request.method.toUpperCase() === 'DELETE') {
      const redis = this.redis.getOrThrow();

      const paginatedKeys = await redis.keys(
        `${this.config.get<string>(ConfigValuesType.CACHE_REDIS_NAMESPACE)}:paginated:${context.getClass().name}:*`,
      );

      await redis.unlink([
        `${this.config.get<string>(ConfigValuesType.CACHE_REDIS_NAMESPACE)}:${cacheKey}`,
        ...paginatedKeys,
      ]);

      return next.handle();
    }

    // Check cache unless ignoreCache is true
    if (request.method.toUpperCase() === 'GET') {
      const cachedResponse = await this.cache.get(cacheKey);

      if (cachedResponse) {
        this.logger.debug(`Cache hit for key ${cacheKey}`);

        return new Observable((observer) => {
          observer.next(cachedResponse);
          observer.complete();
        });
      }

      this.logger.debug(
        `No cache found for key ${cacheKey}, proceeding with request`,
      );
    }

    // If no cache, proceed with the request
    return next.handle().pipe(
      tap(async (responseData) => {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          if (request.method.toUpperCase() === 'POST') {
            this.logger.debug('Updating cache key with new ID');
            cacheKey = `single:${cacheKey}:${responseData.id}`;
          }

          try {
            this.logger.debug(`Setting cache for key: ${cacheKey}`);
            await this.cache.set(cacheKey, responseData);
            this.logger.debug(`Cache set successfully for key: ${cacheKey}`);
          } catch (error) {
            this.logger.error(
              `Error setting cache: ${error.message}`,
              error.stack,
            );
          }
        }
      }),
    );
  }
}
