import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ArticleCreateDTO } from './article.create.dto';

describe('ArticleCreateDTO', () => {
  it('should be defined', () => {
    const dto = new ArticleCreateDTO();
    expect(dto).toBeDefined();
  });

  it('should validate title minimum length', async () => {
    const dto = plainToInstance(
      ArticleCreateDTO,
      {
        title: 'Te', // Less than 3 characters
        description: 'This is a test article description',
      },
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should validate title maximum length', async () => {
    const dto = plainToInstance(
      ArticleCreateDTO,
      {
        title: 'a'.repeat(51), // More than 50 characters
        description: 'This is a test article description',
      },
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should validate title is a string', async () => {
    const dto = plainToInstance(
      ArticleCreateDTO,
      {
        title: 123, // Not a string
        description: 'This is a test article description',
      },
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should validate title is required', async () => {
    const dto = plainToInstance(
      ArticleCreateDTO,
      {
        description: 'This is a test article description',
      },
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('should validate description minimum length', async () => {
    const dto = plainToInstance(
      ArticleCreateDTO,
      {
        title: 'Test Article',
        description: 'Te', // Less than 3 characters
      },
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should validate description maximum length', async () => {
    const dto = plainToInstance(
      ArticleCreateDTO,
      {
        title: 'Test Article',
        description: 'a'.repeat(501), // More than 500 characters
      },
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should validate description is a string', async () => {
    const dto = plainToInstance(
      ArticleCreateDTO,
      {
        title: 'Test Article',
        description: 123, // Not a string
      },
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should validate description is required', async () => {
    const dto = plainToInstance(
      ArticleCreateDTO,
      {
        title: 'Test Article',
      },
      { excludeExtraneousValues: true },
    );

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isDefined');
  });

  it('should not allow id property', async () => {
    const dto = plainToInstance(
      ArticleCreateDTO,
      {
        id: 1,
        title: 'Test Article',
        description: 'This is a test article description',
      },
      { excludeExtraneousValues: true },
    );

    // id should not be part of the DTO since it's not picked
    expect(dto).not.toHaveProperty('id');
  });

  it('should not allow author property', async () => {
    const dto = plainToInstance(
      ArticleCreateDTO,
      {
        title: 'Test Article',
        description: 'This is a test article description',
        author: { id: 1, name: 'Test User', email: 'test@example.com' },
      },
      { excludeExtraneousValues: true },
    );

    // author should not be part of the DTO since it's not picked
    expect(dto).not.toHaveProperty('author');
  });

  it('should not allow createdAt property', async () => {
    const dto = plainToInstance(
      ArticleCreateDTO,
      {
        title: 'Test Article',
        description: 'This is a test article description',
        createdAt: new Date(),
      },
      { excludeExtraneousValues: true },
    );

    // createdAt should not be part of the DTO since it's not picked
    expect(dto).not.toHaveProperty('createdAt');
  });
});
