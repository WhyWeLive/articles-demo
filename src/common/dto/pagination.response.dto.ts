/**
 * Pagination response.
 */
export class PaginationResponseDTO<T> {
  /**
   * Array of items.
   */
  public data: unknown[];

  /**
   * Total amount of items.
   *
   * @example 100
   */
  public total: number;

  /**
   * Current page.
   *
   * @example 0
   */
  public page: number;

  /**
   * Total number of pages.
   *
   * @example 10
   */
  public pages: number;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.page = page;
    this.total = total;
    this.pages = Math.ceil(total / limit);
  }
}
