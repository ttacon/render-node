import type { AutoPaginateOptions, CursorResponse, PaginatedResponse } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  type Header,
  type HeaderInput,
  HeaderInputSchema,
  type HeaderWithCursor,
  HeaderWithCursorSchema,
  type ListHeadersParams,
} from '../schemas/headers.js';
import { BaseResource } from './base.js';

/**
 * Build query parameters for list headers endpoint
 */
function buildListQuery(
  params?: ListHeadersParams,
): Record<string, string | number | boolean | undefined> {
  if (!params) return {};

  const query: Record<string, string | number | boolean | undefined> = {};

  if (params.path) query.path = params.path;
  if (params.name) query.name = params.name;
  if (params.cursor) query.cursor = params.cursor;
  if (params.limit) query.limit = params.limit;

  return query;
}

/**
 * Headers resource client
 *
 * Manage HTTP response headers for static sites.
 */
export class HeadersResource extends BaseResource {
  /**
   * List headers for a service
   *
   * @param serviceId - The service ID
   * @param params - Filter and pagination parameters
   * @returns Paginated list of headers
   */
  async list(serviceId: string, params?: ListHeadersParams): Promise<PaginatedResponse<Header>> {
    const query = buildListQuery(params);
    const response = await this.http.get<HeaderWithCursor[]>(
      `/services/${serviceId}/headers`,
      query,
    );

    const validated = this.validateArray(HeaderWithCursorSchema, response.data);

    const items: CursorResponse<Header>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.header,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all headers
   */
  async *listAll(
    serviceId: string,
    params?: ListHeadersParams & AutoPaginateOptions,
  ): AsyncGenerator<Header, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query = buildListQuery({ ...restParams, cursor, limit });
      const response = await this.http.get<HeaderWithCursor[]>(
        `/services/${serviceId}/headers`,
        query,
      );
      const validated = this.validateArray(HeaderWithCursorSchema, response.data);

      if (validated.length === 0) {
        break;
      }

      for (const item of validated) {
        yield item.header;
        totalFetched++;

        if (maxItems !== undefined && totalFetched >= maxItems) {
          return;
        }
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.header })));

      if (!cursor) {
        break;
      }
    }
  }

  /**
   * Add headers to a service
   *
   * @param serviceId - The service ID
   * @param headers - Headers to add
   * @returns List of created headers
   */
  async create(serviceId: string, headers: HeaderInput[]): Promise<Header[]> {
    const validated = this.validateArray(HeaderInputSchema, headers);
    const response = await this.http.post<HeaderWithCursor[]>(
      `/services/${serviceId}/headers`,
      validated,
    );
    return this.validateArray(HeaderWithCursorSchema, response.data).map((v) => v.header);
  }

  /**
   * Replace all headers for a service
   *
   * @param serviceId - The service ID
   * @param headers - Headers to set
   * @returns List of headers
   */
  async update(serviceId: string, headers: HeaderInput[]): Promise<Header[]> {
    const validated = this.validateArray(HeaderInputSchema, headers);
    const response = await this.http.put<HeaderWithCursor[]>(
      `/services/${serviceId}/headers`,
      validated,
    );
    return this.validateArray(HeaderWithCursorSchema, response.data).map((v) => v.header);
  }

  /**
   * Delete a header
   *
   * @param serviceId - The service ID
   * @param headerId - The header ID
   */
  async delete(serviceId: string, headerId: string): Promise<void> {
    await this.http.delete(`/services/${serviceId}/headers/${headerId}`);
  }
}
