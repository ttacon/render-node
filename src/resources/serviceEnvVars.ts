import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  EnvVarSchema,
  EnvVarWithCursorSchema,
  EnvVarInputSchema,
  type EnvVar,
  type EnvVarWithCursor,
  type EnvVarInput,
} from '../schemas/common.js';

export interface ListEnvVarsParams {
  cursor?: string;
  limit?: number;
}

/**
 * Service Environment Variables resource client
 *
 * Manage environment variables for a service.
 */
export class ServiceEnvVarsResource extends BaseResource {
  /**
   * List environment variables for a service
   *
   * @param serviceId - The service ID
   * @param params - Pagination parameters
   * @returns Paginated list of environment variables
   */
  async list(serviceId: string, params?: ListEnvVarsParams): Promise<PaginatedResponse<EnvVar>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<EnvVarWithCursor[]>(
      `/services/${serviceId}/env-vars`,
      query
    );

    const validated = this.validateArray(EnvVarWithCursorSchema, response.data);

    const items: CursorResponse<EnvVar>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.envVar,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all environment variables
   */
  async *listAll(
    serviceId: string,
    params?: ListEnvVarsParams & AutoPaginateOptions
  ): AsyncGenerator<EnvVar, void, unknown> {
    const { cursor: initialCursor, limit, maxItems } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (cursor) query.cursor = cursor;
      if (limit) query.limit = limit;

      const response = await this.http.get<EnvVarWithCursor[]>(
        `/services/${serviceId}/env-vars`,
        query
      );
      const validated = this.validateArray(EnvVarWithCursorSchema, response.data);

      if (validated.length === 0) {
        break;
      }

      for (const item of validated) {
        yield item.envVar;
        totalFetched++;

        if (maxItems !== undefined && totalFetched >= maxItems) {
          return;
        }
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.envVar })));

      if (!cursor) {
        break;
      }
    }
  }

  /**
   * Update all environment variables for a service
   *
   * This replaces all existing environment variables with the provided list.
   *
   * @param serviceId - The service ID
   * @param envVars - List of environment variables
   * @returns List of updated environment variables
   */
  async update(serviceId: string, envVars: EnvVarInput[]): Promise<EnvVar[]> {
    const validated = this.validateArray(EnvVarInputSchema, envVars);
    const response = await this.http.put<EnvVarWithCursor[]>(
      `/services/${serviceId}/env-vars`,
      validated
    );
    return this.validateArray(EnvVarWithCursorSchema, response.data).map((v) => v.envVar);
  }

  /**
   * Retrieve a specific environment variable
   *
   * @param serviceId - The service ID
   * @param key - The environment variable key
   * @returns The environment variable
   */
  async retrieve(serviceId: string, key: string): Promise<EnvVar> {
    const response = await this.http.get<EnvVar>(`/services/${serviceId}/env-vars/${key}`);
    return this.validate(EnvVarSchema, response.data);
  }

  /**
   * Create or update a specific environment variable
   *
   * @param serviceId - The service ID
   * @param key - The environment variable key
   * @param value - The environment variable value
   * @returns The environment variable
   */
  async set(serviceId: string, key: string, value: string): Promise<EnvVar> {
    const response = await this.http.put<EnvVar>(`/services/${serviceId}/env-vars/${key}`, {
      value,
    });
    return this.validate(EnvVarSchema, response.data);
  }

  /**
   * Delete a specific environment variable
   *
   * @param serviceId - The service ID
   * @param key - The environment variable key
   */
  async delete(serviceId: string, key: string): Promise<void> {
    await this.http.delete(`/services/${serviceId}/env-vars/${key}`);
  }
}
