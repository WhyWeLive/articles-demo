import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ArticleUpdateDTO } from './article.update.dto';

describe('ArticleUpdateDTO', () => {
  it('should be defined', () => {
    const dto = new ArticleUpdateDTO();
    expect(dto).toBeDefined();
  });

  it('should validate an empty DTO', async () => {
    const dto = plainToInstance(
      ArticleUpdateDTO,
      {},
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with only title', async () => {
    const dto = plainToInstance(
      ArticleUpdateDTO,
      {
        title: 'Test Article',
      },
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with only description', async () => {
    const dto = plainToInstance(
      ArticleUpdateDTO,
      {
        description: 'This is a test article description',
      },
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with both title and description', async () => {
    const dto = plainToInstance(
      ArticleUpdateDTO,
      {
        title: 'Test Article',
        description: 'This is a test article description',
      },
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate title minimum length when provided', async () => {
    const dto = plainToInstance(ArticleUpdateDTO, {
      title: 'Te', // Less than 3 characters
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should validate title maximum length when provided', async () => {
    const dto = plainToInstance(ArticleUpdateDTO, {
      title: 'a'.repeat(51), // More than 50 characters
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should not allow id property', async () => {
    const dto = plainToInstance(
      ArticleUpdateDTO,
      {
        id: 1,
        title: 'Test Article',
      },
      { excludeExtraneousValues: true },
    );

    // id should not be part of the DTO since it's not picked in the parent DTO
    expect(dto).not.toHaveProperty('id');
  });

  it('should not allow author property', async () => {
    const dto = plainToInstance(
      ArticleUpdateDTO,
      {
        title: 'Test Article',
        author: { id: 1, name: 'Test User', email: 'test@example.com' },
      },
      { excludeExtraneousValues: true },
    );

    // author should not be part of the DTO since it's not picked in the parent DTO
    expect(dto).not.toHaveProperty('author');
  });

  it('should not allow createdAt property', async () => {
    const dto = plainToInstance(
      ArticleUpdateDTO,
      {
        title: 'Test Article',
        createdAt: new Date(),
      },
      { excludeExtraneousValues: true },
    );

    // createdAt should not be part of the DTO since it's not picked in the parent DTO
    expect(dto).not.toHaveProperty('createdAt');
  });
});
