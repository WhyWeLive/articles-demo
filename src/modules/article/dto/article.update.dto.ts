import { PartialType } from '@nestjs/swagger';
import { ArticleCreateDTO } from '@modules/article/dto/article.create.dto';

export class ArticleUpdateDTO extends PartialType(ArticleCreateDTO) {}
