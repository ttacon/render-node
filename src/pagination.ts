import type { HttpClient } from './http.js';

/**
 * Standard pagination parameters used by most list endpoints
 */
export interface PaginationParams {
  /**
   * Cursor for pagination. To get the next page, pass the cursor from the previous response.
   */
  cursor?: string;
  /**
   * Maximum number of items to return (1-100, default varies by endpoint)
   */
  limit?: number;
}

/**
 * Response with cursor for pagination
 */
export interface CursorResponse<T> {
  cursor: string;
  item: T;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  cursor?: string;
  hasMore: boolean;
}

/**
 * Options for auto-pagination
 */
export interface AutoPaginateOptions extends PaginationParams {
  /**
   * Maximum total items to fetch across all pages (default: unlimited)
   */
  maxItems?: number;
}

/**
 * Extract cursor from the last item in a cursor-wrapped response
 */
export function extractCursor<T>(items: CursorResponse<T>[]): string | undefined {
  const lastItem = items[items.length - 1];
  return lastItem?.cursor;
}

/**
 * Unwrap cursor response items
 */
export function unwrapItems<T>(items: CursorResponse<T>[]): T[] {
  return items.map((item) => item.item);
}

/**
 * Create a paginated response from cursor-wrapped items
 */
export function createPaginatedResponse<T>(
  items: CursorResponse<T>[],
  limit?: number,
): PaginatedResponse<T> {
  const cursor = extractCursor(items);
  // If we got fewer items than the limit (or default 20), there are no more pages
  const effectiveLimit = limit ?? 20;
  const hasMore = items.length >= effectiveLimit && cursor !== undefined;

  return {
    items: unwrapItems(items),
    cursor,
    hasMore,
  };
}

/**
 * Type for a fetch function that returns cursor-wrapped items
 */
export type FetchPage<T> = (cursor?: string, limit?: number) => Promise<CursorResponse<T>[]>;

/**
 * Create an async generator that automatically fetches all pages
 */
export async function* paginate<T>(
  fetchPage: FetchPage<T>,
  options: AutoPaginateOptions = {},
): AsyncGenerator<T, void, unknown> {
  const { cursor: initialCursor, limit, maxItems } = options;
  let cursor = initialCursor;
  let totalFetched = 0;

  while (true) {
    const items = await fetchPage(cursor, limit);

    if (items.length === 0) {
      break;
    }

    for (const item of items) {
      yield item.item;
      totalFetched++;

      if (maxItems !== undefined && totalFetched >= maxItems) {
        return;
      }
    }

    cursor = extractCursor(items);

    // No more pages
    if (!cursor) {
      break;
    }
  }
}

/**
 * Collect all items from an async generator into an array
 */
export async function collectAll<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of generator) {
    items.push(item);
  }
  return items;
}

/**
 * Helper to create pagination methods for a resource
 */
export function createPaginationHelpers<T, TParams extends PaginationParams>(
  http: HttpClient,
  path: string,
  buildQuery: (params?: TParams) => Record<string, string | number | boolean | undefined>,
) {
  const fetchPage = async (
    params?: TParams,
    cursor?: string,
    limit?: number,
  ): Promise<CursorResponse<T>[]> => {
    const query = buildQuery(params);
    if (cursor) query.cursor = cursor;
    if (limit) query.limit = limit;

    const response = await http.get<CursorResponse<T>[]>(path, query);
    return response.data;
  };

  return {
    /**
     * Fetch a single page of results
     */
    async list(params?: TParams): Promise<PaginatedResponse<T>> {
      const items = await fetchPage(params, params?.cursor, params?.limit);
      return createPaginatedResponse(items, params?.limit);
    },

    /**
     * Async generator that automatically fetches all pages
     */
    async *listAll(params?: TParams & AutoPaginateOptions): AsyncGenerator<T, void, unknown> {
      const { cursor, limit, maxItems, ...restParams } = params ?? {};
      let currentCursor = cursor;
      let totalFetched = 0;

      while (true) {
        const items = await fetchPage(restParams as TParams, currentCursor, limit);

        if (items.length === 0) {
          break;
        }

        for (const item of items) {
          yield item.item;
          totalFetched++;

          if (maxItems !== undefined && totalFetched >= maxItems) {
            return;
          }
        }

        currentCursor = extractCursor(items);
        if (!currentCursor) {
          break;
        }
      }
    },
  };
}
