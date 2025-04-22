import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ArticleItemDTO } from './article.item.dto';
import { AuthUserPublicDTO } from '@modules/auth/dto/auth.user-public.dto';

describe('ArticleItemDTO', () => {
  it('should be defined', () => {
    const dto = new ArticleItemDTO();
    expect(dto).toBeDefined();
  });

  it('should validate a valid DTO', async () => {
    const author: AuthUserPublicDTO = {
      id: 1,
      name: 'Test User',
    };

    const dto = plainToInstance(ArticleItemDTO, {
      id: 1,
      title: 'Test Article',
      description: 'This is a test article description',
      author,
      createdAt: new Date(),
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate title minimum length', async () => {
    const dto = plainToInstance(ArticleItemDTO, {
      title: 'Te', // Less than 3 characters
      description: 'This is a test article description',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should validate title maximum length', async () => {
    const dto = plainToInstance(ArticleItemDTO, {
      title: 'a'.repeat(51), // More than 50 characters
      description: 'This is a test article description',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should validate title is a string', async () => {
    const dto = plainToInstance(ArticleItemDTO, {
      title: 123, // Not a string
      description: 'This is a test article description',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should validate title is required', async () => {
    const dto = plainToInstance(ArticleItemDTO, {
      description: 'This is a test article description',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('should validate description minimum length', async () => {
    const dto = plainToInstance(ArticleItemDTO, {
      title: 'Test Article',
      description: 'Te', // Less than 3 characters
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should validate description maximum length', async () => {
    const dto = plainToInstance(ArticleItemDTO, {
      title: 'Test Article',
      description: 'a'.repeat(501), // More than 500 characters
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should validate description is a string', async () => {
    const dto = plainToInstance(ArticleItemDTO, {
      title: 'Test Article',
      description: 123, // Not a string
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should validate description is required', async () => {
    const dto = plainToInstance(ArticleItemDTO, {
      title: 'Test Article',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });
});
