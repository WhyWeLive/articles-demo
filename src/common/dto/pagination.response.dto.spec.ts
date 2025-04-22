import { PaginationResponseDTO } from './pagination.response.dto';

describe('PaginationResponseDto', () => {
  it('should be defined', () => {
    const dto = new PaginationResponseDTO([], 0, 0, 10);
    expect(dto).toBeDefined();
  });

  it('should correctly initialize with empty data', () => {
    const data: string[] = [];
    const total = 0;
    const page = 0;
    const limit = 10;

    const dto = new PaginationResponseDTO<string>(data, total, page, limit);

    expect(dto.data).toEqual([]);
    expect(dto.total).toBe(0);
    expect(dto.page).toBe(0);
    expect(dto.pages).toBe(0);
  });

  it('should correctly initialize with data', () => {
    const data = ['item1', 'item2', 'item3'];
    const total = 3;
    const page = 0;
    const limit = 10;

    const dto = new PaginationResponseDTO<string>(data, total, page, limit);

    expect(dto.data).toEqual(data);
    expect(dto.total).toBe(total);
    expect(dto.page).toBe(page);
    expect(dto.pages).toBe(1); // 3/10 = 0.3, ceil(0.3) = 1
  });

  it('should correctly calculate pages for exact division', () => {
    const data = Array(10).fill('item');
    const total = 20;
    const page = 0;
    const limit = 10;

    const dto = new PaginationResponseDTO<string>(data, total, page, limit);

    expect(dto.pages).toBe(2); // 20/10 = 2
  });

  it('should correctly calculate pages for non-exact division', () => {
    const data = Array(10).fill('item');
    const total = 25;
    const page = 0;
    const limit = 10;

    const dto = new PaginationResponseDTO<string>(data, total, page, limit);

    expect(dto.pages).toBe(3); // 25/10 = 2.5, ceil(2.5) = 3
  });

  it('should work with different page values', () => {
    const data = Array(10).fill('item');
    const total = 100;
    const page = 5;
    const limit = 10;

    const dto = new PaginationResponseDTO<string>(data, total, page, limit);

    expect(dto.page).toBe(5);
    expect(dto.pages).toBe(10); // 100/10 = 10
  });

  it('should work with different generic types', () => {
    interface TestItem {
      id: number;
      name: string;
    }

    const data: TestItem[] = [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' },
    ];
    const total = 2;
    const page = 0;
    const limit = 10;

    const dto = new PaginationResponseDTO<TestItem>(data, total, page, limit);

    expect(dto.data).toEqual(data);
    expect(dto.total).toBe(total);
  });
});
