import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import {
  CACHE_OPTIONS_METADATA,
  RootCacheInterceptor,
} from '@common/interceptor/root.cache-interceptor.service';
import { CacheOptionsDTO } from '@common/dto/cache.options.dto';

export const UseCache = (options: CacheOptionsDTO = {}) =>
  applyDecorators(
    SetMetadata(CACHE_OPTIONS_METADATA, options),
    UseInterceptors(RootCacheInterceptor),
  );
