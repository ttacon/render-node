import type { AutoPaginateOptions, CursorResponse, PaginatedResponse } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  type SecretFile,
  type SecretFileInput,
  SecretFileInputSchema,
  SecretFileSchema,
  type SecretFileWithCursor,
  SecretFileWithCursorSchema,
} from '../schemas/common.js';
import { BaseResource } from './base.js';

export interface ListSecretFilesParams {
  cursor?: string;
  limit?: number;
}

/**
 * Service Secret Files resource client
 *
 * Manage secret files for a service.
 */
export class ServiceSecretFilesResource extends BaseResource {
  /**
   * List secret files for a service
   *
   * @param serviceId - The service ID
   * @param params - Pagination parameters
   * @returns Paginated list of secret files (names only, not contents)
   */
  async list(
    serviceId: string,
    params?: ListSecretFilesParams,
  ): Promise<PaginatedResponse<SecretFile>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.limit) query.limit = params.limit;

    const response = await this.http.get<SecretFileWithCursor[]>(
      `/services/${serviceId}/secret-files`,
      query,
    );

    const validated = this.validateArray(SecretFileWithCursorSchema, response.data);

    const items: CursorResponse<SecretFile>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.secretFile,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all secret files
   */
  async *listAll(
    serviceId: string,
    params?: ListSecretFilesParams & AutoPaginateOptions,
  ): AsyncGenerator<SecretFile, void, unknown> {
    const { cursor: initialCursor, limit, maxItems } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (cursor) query.cursor = cursor;
      if (limit) query.limit = limit;

      const response = await this.http.get<SecretFileWithCursor[]>(
        `/services/${serviceId}/secret-files`,
        query,
      );
      const validated = this.validateArray(SecretFileWithCursorSchema, response.data);

      if (validated.length === 0) {
        break;
      }

      for (const item of validated) {
        yield item.secretFile;
        totalFetched++;

        if (maxItems !== undefined && totalFetched >= maxItems) {
          return;
        }
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.secretFile })));

      if (!cursor) {
        break;
      }
    }
  }

  /**
   * Update all secret files for a service
   *
   * This replaces all existing secret files with the provided list.
   *
   * @param serviceId - The service ID
   * @param secretFiles - List of secret files
   * @returns List of secret file names
   */
  async update(serviceId: string, secretFiles: SecretFileInput[]): Promise<SecretFile[]> {
    const validated = this.validateArray(SecretFileInputSchema, secretFiles);
    const response = await this.http.put<SecretFileWithCursor[]>(
      `/services/${serviceId}/secret-files`,
      validated,
    );
    return this.validateArray(SecretFileWithCursorSchema, response.data).map((v) => v.secretFile);
  }

  /**
   * Retrieve a specific secret file (name only)
   *
   * @param serviceId - The service ID
   * @param name - The secret file name
   * @returns The secret file metadata
   */
  async retrieve(serviceId: string, name: string): Promise<SecretFile> {
    const response = await this.http.get<SecretFile>(`/services/${serviceId}/secret-files/${name}`);
    return this.validate(SecretFileSchema, response.data);
  }

  /**
   * Create or update a specific secret file
   *
   * @param serviceId - The service ID
   * @param name - The secret file name
   * @param content - The secret file content
   * @returns The secret file metadata
   */
  async set(serviceId: string, name: string, content: string): Promise<SecretFile> {
    const response = await this.http.put<SecretFile>(
      `/services/${serviceId}/secret-files/${name}`,
      { content },
    );
    return this.validate(SecretFileSchema, response.data);
  }

  /**
   * Delete a specific secret file
   *
   * @param serviceId - The service ID
   * @param name - The secret file name
   */
  async delete(serviceId: string, name: string): Promise<void> {
    await this.http.delete(`/services/${serviceId}/secret-files/${name}`);
  }
}
