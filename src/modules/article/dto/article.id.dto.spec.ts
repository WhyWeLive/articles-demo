import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ArticleIDDTO } from './article.id.dto';

describe('ArticleIDDTO', () => {
  it('should be defined', () => {
    const dto = new ArticleIDDTO();
    expect(dto).toBeDefined();
  });

  it('should validate a valid numeric ID', async () => {
    const dto = plainToInstance(ArticleIDDTO, { id: 1 });

    expect(dto.id).toBe(1);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should convert string ID to number', async () => {
    const dto = plainToInstance(ArticleIDDTO, { id: '123' });

    expect(dto.id).toBe(123);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate that ID is a number', async () => {
    const dto = plainToInstance(ArticleIDDTO, { id: 'not-a-number' });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('should validate that ID is required', async () => {
    const dto = plainToInstance(ArticleIDDTO, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate that ID cannot be null', async () => {
    const dto = plainToInstance(ArticleIDDTO, { id: null });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate that ID cannot be undefined', async () => {
    const dto = plainToInstance(ArticleIDDTO, { id: undefined });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate that ID cannot be an object', async () => {
    const dto = plainToInstance(ArticleIDDTO, { id: {} });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('should validate that ID cannot be an array', async () => {
    const dto = plainToInstance(ArticleIDDTO, { id: [] });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });
});
