import type { AutoPaginateOptions, CursorResponse, PaginatedResponse } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  type ListRoutesParams,
  type Route,
  type RouteInput,
  RouteInputSchema,
  type RoutePatchInput,
  RoutePatchInputSchema,
  RouteSchema,
  type RouteWithCursor,
  RouteWithCursorSchema,
} from '../schemas/routes.js';
import { BaseResource } from './base.js';

/**
 * Build query parameters for list routes endpoint
 */
function buildListQuery(
  params?: ListRoutesParams,
): Record<string, string | number | boolean | undefined> {
  if (!params) return {};

  const query: Record<string, string | number | boolean | undefined> = {};

  if (params.type) query.type = params.type;
  if (params.source) query.source = params.source;
  if (params.destination) query.destination = params.destination;
  if (params.cursor) query.cursor = params.cursor;
  if (params.limit) query.limit = params.limit;

  return query;
}

/**
 * Routes resource client
 *
 * Manage redirect and rewrite rules for static sites.
 */
export class RoutesResource extends BaseResource {
  /**
   * List routes for a service
   *
   * @param serviceId - The service ID
   * @param params - Filter and pagination parameters
   * @returns Paginated list of routes
   */
  async list(serviceId: string, params?: ListRoutesParams): Promise<PaginatedResponse<Route>> {
    const query = buildListQuery(params);
    const response = await this.http.get<RouteWithCursor[]>(`/services/${serviceId}/routes`, query);

    const validated = this.validateArray(RouteWithCursorSchema, response.data);

    const items: CursorResponse<Route>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.route,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all routes
   */
  async *listAll(
    serviceId: string,
    params?: ListRoutesParams & AutoPaginateOptions,
  ): AsyncGenerator<Route, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query = buildListQuery({ ...restParams, cursor, limit });
      const response = await this.http.get<RouteWithCursor[]>(
        `/services/${serviceId}/routes`,
        query,
      );
      const validated = this.validateArray(RouteWithCursorSchema, response.data);

      if (validated.length === 0) {
        break;
      }

      for (const item of validated) {
        yield item.route;
        totalFetched++;

        if (maxItems !== undefined && totalFetched >= maxItems) {
          return;
        }
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.route })));

      if (!cursor) {
        break;
      }
    }
  }

  /**
   * Add a route to a service
   *
   * @param serviceId - The service ID
   * @param route - Route configuration
   * @returns The created route
   */
  async create(serviceId: string, route: RouteInput): Promise<Route> {
    const validated = this.validate(RouteInputSchema, route);
    const response = await this.http.post<Route>(`/services/${serviceId}/routes`, validated);
    return this.validate(RouteSchema, response.data);
  }

  /**
   * Replace all routes for a service
   *
   * @param serviceId - The service ID
   * @param routes - Routes to set
   * @returns List of routes
   */
  async replace(serviceId: string, routes: RouteInput[]): Promise<Route[]> {
    const validated = this.validateArray(RouteInputSchema, routes);
    const response = await this.http.put<RouteWithCursor[]>(
      `/services/${serviceId}/routes`,
      validated,
    );
    return this.validateArray(RouteWithCursorSchema, response.data).map((v) => v.route);
  }

  /**
   * Update existing routes
   *
   * @param serviceId - The service ID
   * @param routes - Routes to update (must include ID)
   * @returns List of updated routes
   */
  async update(serviceId: string, routes: RoutePatchInput[]): Promise<Route[]> {
    const validated = this.validateArray(RoutePatchInputSchema, routes);
    const response = await this.http.patch<RouteWithCursor[]>(
      `/services/${serviceId}/routes`,
      validated,
    );
    return this.validateArray(RouteWithCursorSchema, response.data).map((v) => v.route);
  }

  /**
   * Delete a route
   *
   * @param serviceId - The service ID
   * @param routeId - The route ID
   */
  async delete(serviceId: string, routeId: string): Promise<void> {
    await this.http.delete(`/services/${serviceId}/routes/${routeId}`);
  }
}
