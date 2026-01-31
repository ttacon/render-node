import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  RedisSchema,
  RedisWithCursorSchema,
  RedisConnectionInfoSchema,
  CreateRedisInputSchema,
  UpdateRedisInputSchema,
  type Redis,
  type RedisWithCursor,
  type RedisConnectionInfo,
  type CreateRedisInput,
  type UpdateRedisInput,
  type ListRedisParams,
} from '../schemas/redis.js';

/**
 * Redis resource client
 *
 * @deprecated Use KeyValueResource instead. The Redis API is deprecated.
 */
export class RedisResource extends BaseResource {
  async list(params?: ListRedisParams): Promise<PaginatedResponse<Redis>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.name) query.name = params.name;
    if (params?.status) query.status = params.status;
    if (params?.region) query.region = params.region;
    if (params?.suspended) query.suspended = params.suspended;
    if (params?.ownerId) {
      query.ownerId = Array.isArray(params.ownerId) ? params.ownerId.join(',') : params.ownerId;
    }
    if (params?.environmentId) query.environmentId = params.environmentId;
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<RedisWithCursor[]>('/redis', query);
    const validated = this.validateArray(RedisWithCursorSchema, response.data);

    const items: CursorResponse<Redis>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.redis,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  async *listAll(
    params?: ListRedisParams & AutoPaginateOptions
  ): AsyncGenerator<Redis, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (restParams.name) query.name = restParams.name;
      if (restParams.status) query.status = restParams.status;
      if (restParams.region) query.region = restParams.region;
      if (restParams.suspended) query.suspended = restParams.suspended;
      if (restParams.ownerId) {
        query.ownerId = Array.isArray(restParams.ownerId)
          ? restParams.ownerId.join(',')
          : restParams.ownerId;
      }
      if (restParams.environmentId) query.environmentId = restParams.environmentId;
      if (cursor) query.cursor = cursor;
      if (limit) query.limit = limit;

      const response = await this.http.get<RedisWithCursor[]>('/redis', query);
      const validated = this.validateArray(RedisWithCursorSchema, response.data);

      if (validated.length === 0) break;

      for (const item of validated) {
        yield item.redis;
        totalFetched++;
        if (maxItems !== undefined && totalFetched >= maxItems) return;
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.redis })));
      if (!cursor) break;
    }
  }

  /**
   * @deprecated Use KeyValueResource.create instead
   */
  async create(input: CreateRedisInput): Promise<Redis> {
    const validated = this.validate(CreateRedisInputSchema, input);
    const response = await this.http.post<Redis>('/redis', validated);
    return this.validate(RedisSchema, response.data);
  }

  async retrieve(redisId: string): Promise<Redis> {
    const response = await this.http.get<Redis>(`/redis/${redisId}`);
    return this.validate(RedisSchema, response.data);
  }

  async update(redisId: string, input: UpdateRedisInput): Promise<Redis> {
    const validated = this.validate(UpdateRedisInputSchema, input);
    const response = await this.http.patch<Redis>(`/redis/${redisId}`, validated);
    return this.validate(RedisSchema, response.data);
  }

  async delete(redisId: string): Promise<void> {
    await this.http.delete(`/redis/${redisId}`);
  }

  async connectionInfo(redisId: string): Promise<RedisConnectionInfo> {
    const response = await this.http.get<RedisConnectionInfo>(`/redis/${redisId}/connection-info`);
    return this.validate(RedisConnectionInfoSchema, response.data);
  }
}
