import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  DeploySchema,
  DeployWithCursorSchema,
  CreateDeployInputSchema,
  RollbackDeployInputSchema,
  type Deploy,
  type DeployWithCursor,
  type CreateDeployInput,
  type RollbackDeployInput,
  type ListDeploysParams,
} from '../schemas/deploys.js';

/**
 * Build query parameters for list deploys endpoint
 */
function buildListQuery(
  params?: ListDeploysParams
): Record<string, string | number | boolean | undefined> {
  if (!params) return {};

  const query: Record<string, string | number | boolean | undefined> = {};

  if (params.startTime) query.startTime = params.startTime;
  if (params.endTime) query.endTime = params.endTime;
  if (params.cursor) query.cursor = params.cursor;
  if (params.limit) query.limit = params.limit;

  return query;
}

/**
 * Deploys resource client
 *
 * Manage deployments for services.
 */
export class DeploysResource extends BaseResource {
  /**
   * List deploys for a service
   *
   * @param serviceId - The service ID
   * @param params - Filter and pagination parameters
   * @returns Paginated list of deploys
   *
   * @example
   * ```ts
   * const { items, hasMore } = await client.services.deploys.list('srv-xxxxx');
   * ```
   */
  async list(serviceId: string, params?: ListDeploysParams): Promise<PaginatedResponse<Deploy>> {
    const query = buildListQuery(params);
    const response = await this.http.get<DeployWithCursor[]>(
      `/services/${serviceId}/deploys`,
      query
    );

    const validated = this.validateArray(DeployWithCursorSchema, response.data);

    const items: CursorResponse<Deploy>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.deploy,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all pages of deploys
   *
   * @param serviceId - The service ID
   * @param params - Filter and pagination parameters
   * @yields Deploy objects one at a time
   *
   * @example
   * ```ts
   * for await (const deploy of client.services.deploys.listAll('srv-xxxxx')) {
   *   console.log(deploy.id, deploy.status);
   * }
   * ```
   */
  async *listAll(
    serviceId: string,
    params?: ListDeploysParams & AutoPaginateOptions
  ): AsyncGenerator<Deploy, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query = buildListQuery({ ...restParams, cursor, limit });
      const response = await this.http.get<DeployWithCursor[]>(
        `/services/${serviceId}/deploys`,
        query
      );
      const validated = this.validateArray(DeployWithCursorSchema, response.data);

      if (validated.length === 0) {
        break;
      }

      for (const item of validated) {
        yield item.deploy;
        totalFetched++;

        if (maxItems !== undefined && totalFetched >= maxItems) {
          return;
        }
      }

      cursor = extractCursor(
        validated.map((v) => ({ cursor: v.cursor, item: v.deploy }))
      );

      if (!cursor) {
        break;
      }
    }
  }

  /**
   * Create a new deploy for a service
   *
   * @param serviceId - The service ID
   * @param input - Deploy configuration
   * @returns The created deploy
   *
   * @example
   * ```ts
   * const deploy = await client.services.deploys.create('srv-xxxxx', {
   *   clearCache: 'clear',
   * });
   * ```
   */
  async create(serviceId: string, input?: CreateDeployInput): Promise<Deploy> {
    const validated = input ? this.validate(CreateDeployInputSchema, input) : undefined;
    const response = await this.http.post<Deploy>(`/services/${serviceId}/deploys`, validated);
    return this.validate(DeploySchema, response.data);
  }

  /**
   * Retrieve a deploy by ID
   *
   * @param serviceId - The service ID
   * @param deployId - The deploy ID
   * @returns The deploy
   *
   * @example
   * ```ts
   * const deploy = await client.services.deploys.retrieve('srv-xxxxx', 'dep-xxxxx');
   * ```
   */
  async retrieve(serviceId: string, deployId: string): Promise<Deploy> {
    const response = await this.http.get<Deploy>(`/services/${serviceId}/deploys/${deployId}`);
    return this.validate(DeploySchema, response.data);
  }

  /**
   * Cancel a running deploy
   *
   * @param serviceId - The service ID
   * @param deployId - The deploy ID
   * @returns The cancelled deploy
   *
   * @example
   * ```ts
   * const deploy = await client.services.deploys.cancel('srv-xxxxx', 'dep-xxxxx');
   * ```
   */
  async cancel(serviceId: string, deployId: string): Promise<Deploy> {
    const response = await this.http.post<Deploy>(
      `/services/${serviceId}/deploys/${deployId}/cancel`
    );
    return this.validate(DeploySchema, response.data);
  }

  /**
   * Rollback to a previous deploy
   *
   * @param serviceId - The service ID
   * @param input - Rollback configuration with the deploy ID to roll back to
   * @returns The new deploy created for the rollback
   *
   * @example
   * ```ts
   * const deploy = await client.services.deploys.rollback('srv-xxxxx', {
   *   deployId: 'dep-xxxxx',
   * });
   * ```
   */
  async rollback(serviceId: string, input: RollbackDeployInput): Promise<Deploy> {
    const validated = this.validate(RollbackDeployInputSchema, input);
    const response = await this.http.post<Deploy>(`/services/${serviceId}/rollback`, validated);
    return this.validate(DeploySchema, response.data);
  }
}
