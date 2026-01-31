import type { AutoPaginateOptions, CursorResponse, PaginatedResponse } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  type Blueprint,
  BlueprintSchema,
  type BlueprintSync,
  type BlueprintSyncWithCursor,
  BlueprintSyncWithCursorSchema,
  type BlueprintWithCursor,
  BlueprintWithCursorSchema,
  type ListBlueprintSyncsParams,
  type ListBlueprintsParams,
  type UpdateBlueprintInput,
  UpdateBlueprintInputSchema,
} from '../schemas/blueprints.js';
import { BaseResource } from './base.js';

/**
 * Blueprints resource client
 */
export class BlueprintsResource extends BaseResource {
  async list(params?: ListBlueprintsParams): Promise<PaginatedResponse<Blueprint>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.ownerId) {
      query.ownerId = Array.isArray(params.ownerId) ? params.ownerId.join(',') : params.ownerId;
    }
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<BlueprintWithCursor[]>('/blueprints', query);
    const validated = this.validateArray(BlueprintWithCursorSchema, response.data);

    const items: CursorResponse<Blueprint>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.blueprint,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  async *listAll(
    params?: ListBlueprintsParams & AutoPaginateOptions,
  ): AsyncGenerator<Blueprint, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (restParams.ownerId) {
        query.ownerId = Array.isArray(restParams.ownerId)
          ? restParams.ownerId.join(',')
          : restParams.ownerId;
      }
      if (cursor) query.cursor = cursor;
      if (limit) query.limit = limit;

      const response = await this.http.get<BlueprintWithCursor[]>('/blueprints', query);
      const validated = this.validateArray(BlueprintWithCursorSchema, response.data);

      if (validated.length === 0) break;

      for (const item of validated) {
        yield item.blueprint;
        totalFetched++;
        if (maxItems !== undefined && totalFetched >= maxItems) return;
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.blueprint })));
      if (!cursor) break;
    }
  }

  async retrieve(blueprintId: string): Promise<Blueprint> {
    const response = await this.http.get<Blueprint>(`/blueprints/${blueprintId}`);
    return this.validate(BlueprintSchema, response.data);
  }

  async update(blueprintId: string, input: UpdateBlueprintInput): Promise<Blueprint> {
    const validated = this.validate(UpdateBlueprintInputSchema, input);
    const response = await this.http.patch<Blueprint>(`/blueprints/${blueprintId}`, validated);
    return this.validate(BlueprintSchema, response.data);
  }

  async disconnect(blueprintId: string): Promise<void> {
    await this.http.delete(`/blueprints/${blueprintId}`);
  }

  async listSyncs(
    blueprintId: string,
    params?: ListBlueprintSyncsParams,
  ): Promise<PaginatedResponse<BlueprintSync>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<BlueprintSyncWithCursor[]>(
      `/blueprints/${blueprintId}/syncs`,
      query,
    );
    const validated = this.validateArray(BlueprintSyncWithCursorSchema, response.data);

    const items: CursorResponse<BlueprintSync>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.sync,
    }));

    return createPaginatedResponse(items, params?.limit);
  }
}
