import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  KeyValueSchema,
  KeyValueWithCursorSchema,
  KeyValueConnectionInfoSchema,
  CreateKeyValueInputSchema,
  UpdateKeyValueInputSchema,
  type KeyValue,
  type KeyValueWithCursor,
  type KeyValueConnectionInfo,
  type CreateKeyValueInput,
  type UpdateKeyValueInput,
  type ListKeyValueParams,
} from '../schemas/keyValue.js';

/**
 * Build query parameters for list key-value endpoint
 */
function buildListQuery(
  params?: ListKeyValueParams
): Record<string, string | number | boolean | undefined> {
  if (!params) return {};

  const query: Record<string, string | number | boolean | undefined> = {};

  if (params.name) query.name = params.name;
  if (params.status) query.status = params.status;
  if (params.region) query.region = params.region;
  if (params.suspended) query.suspended = params.suspended;
  if (params.createdBefore) query.createdBefore = params.createdBefore;
  if (params.createdAfter) query.createdAfter = params.createdAfter;
  if (params.updatedBefore) query.updatedBefore = params.updatedBefore;
  if (params.updatedAfter) query.updatedAfter = params.updatedAfter;
  if (params.ownerId) {
    query.ownerId = Array.isArray(params.ownerId) ? params.ownerId.join(',') : params.ownerId;
  }
  if (params.environmentId) query.environmentId = params.environmentId;
  if (params.cursor) query.cursor = params.cursor;
  if (params.limit) query.limit = params.limit;

  return query;
}

/**
 * Key Value resource client
 *
 * Manage Key Value (Redis-compatible) instances.
 */
export class KeyValueResource extends BaseResource {
  /**
   * List Key Value instances
   */
  async list(params?: ListKeyValueParams): Promise<PaginatedResponse<KeyValue>> {
    const query = buildListQuery(params);
    const response = await this.http.get<KeyValueWithCursor[]>('/key-value', query);

    const validated = this.validateArray(KeyValueWithCursorSchema, response.data);

    const items: CursorResponse<KeyValue>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.keyValue,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all Key Value instances
   */
  async *listAll(
    params?: ListKeyValueParams & AutoPaginateOptions
  ): AsyncGenerator<KeyValue, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query = buildListQuery({ ...restParams, cursor, limit });
      const response = await this.http.get<KeyValueWithCursor[]>('/key-value', query);
      const validated = this.validateArray(KeyValueWithCursorSchema, response.data);

      if (validated.length === 0) {
        break;
      }

      for (const item of validated) {
        yield item.keyValue;
        totalFetched++;

        if (maxItems !== undefined && totalFetched >= maxItems) {
          return;
        }
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.keyValue })));

      if (!cursor) {
        break;
      }
    }
  }

  /**
   * Create a new Key Value instance
   */
  async create(input: CreateKeyValueInput): Promise<KeyValue> {
    const validated = this.validate(CreateKeyValueInputSchema, input);
    const response = await this.http.post<KeyValue>('/key-value', validated);
    return this.validate(KeyValueSchema, response.data);
  }

  /**
   * Retrieve a Key Value instance by ID
   */
  async retrieve(keyValueId: string): Promise<KeyValue> {
    const response = await this.http.get<KeyValue>(`/key-value/${keyValueId}`);
    return this.validate(KeyValueSchema, response.data);
  }

  /**
   * Update a Key Value instance
   */
  async update(keyValueId: string, input: UpdateKeyValueInput): Promise<KeyValue> {
    const validated = this.validate(UpdateKeyValueInputSchema, input);
    const response = await this.http.patch<KeyValue>(`/key-value/${keyValueId}`, validated);
    return this.validate(KeyValueSchema, response.data);
  }

  /**
   * Delete a Key Value instance
   */
  async delete(keyValueId: string): Promise<void> {
    await this.http.delete(`/key-value/${keyValueId}`);
  }

  /**
   * Get connection info for a Key Value instance
   */
  async connectionInfo(keyValueId: string): Promise<KeyValueConnectionInfo> {
    const response = await this.http.get<KeyValueConnectionInfo>(
      `/key-value/${keyValueId}/connection-info`
    );
    return this.validate(KeyValueConnectionInfoSchema, response.data);
  }

  /**
   * Suspend a Key Value instance
   */
  async suspend(keyValueId: string): Promise<void> {
    await this.http.post(`/key-value/${keyValueId}/suspend`);
  }

  /**
   * Resume a suspended Key Value instance
   */
  async resume(keyValueId: string): Promise<void> {
    await this.http.post(`/key-value/${keyValueId}/resume`);
  }
}
