import { PickType } from '@nestjs/swagger';
import { ArticleItemDTO } from '@modules/article/dto/article.item.dto';

export class ArticleCreateDTO extends PickType(ArticleItemDTO, [
  'title',
  'description',
] as const) {}
