import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationRequestDTO } from './pagination.request.dto';

describe('PaginationRequestDto', () => {
  it('should be defined', () => {
    const dto = new PaginationRequestDTO();
    expect(dto).toBeDefined();
  });

  it('should use default values when no values are provided', async () => {
    const dto = plainToInstance(PaginationRequestDTO, {});
    expect(dto.page).toBe(0);
    expect(dto.limit).toBe(10);
    expect(dto.search).toBeUndefined();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept valid values', async () => {
    const dto = plainToInstance(PaginationRequestDTO, {
      page: 2,
      limit: 20,
      search: 'test',
    });
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
    expect(dto.search).toBe('test');

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should convert string values to numbers for page and limit', async () => {
    const dto = plainToInstance(PaginationRequestDTO, {
      page: '3',
      limit: '15',
    });
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(15);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate that page is a number', async () => {
    const dto = plainToInstance(PaginationRequestDTO, {
      page: 'not-a-number',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('should validate that limit is a number', async () => {
    const dto = plainToInstance(PaginationRequestDTO, {
      limit: 'not-a-number',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('should validate that search is a string', async () => {
    const dto = plainToInstance(PaginationRequestDTO, {
      search: 123,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
