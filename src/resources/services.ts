import { BaseResource } from './base.js';
import type { HttpClient } from '../http.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  ServiceSchema,
  ServiceWithCursorSchema,
  ServiceAndDeploySchema,
  CreateServiceInputSchema,
  UpdateServiceInputSchema,
  ScaleServiceInputSchema,
  AutoscalingInputSchema,
  ServiceInstanceSchema,
  PreviewServiceInputSchema,
  type Service,
  type ServiceWithCursor,
  type ServiceAndDeploy,
  type CreateServiceInput,
  type UpdateServiceInput,
  type ScaleServiceInput,
  type AutoscalingInput,
  type ServiceInstance,
  type ListServicesParams,
  type PreviewServiceInput,
} from '../schemas/services.js';
import { DeploysResource } from './deploys.js';
import { CustomDomainsResource } from './customDomains.js';
import { ServiceEnvVarsResource } from './serviceEnvVars.js';
import { ServiceSecretFilesResource } from './serviceSecretFiles.js';
import { HeadersResource } from './headers.js';
import { RoutesResource } from './routes.js';
import { JobsResource } from './jobs.js';

/**
 * Build query parameters for list services endpoint
 */
function buildListQuery(
  params?: ListServicesParams
): Record<string, string | number | boolean | undefined> {
  if (!params) return {};

  const query: Record<string, string | number | boolean | undefined> = {};

  if (params.name) query.name = params.name;
  if (params.type) {
    query.type = Array.isArray(params.type) ? params.type.join(',') : params.type;
  }
  if (params.environmentId) query.environmentId = params.environmentId;
  if (params.env) query.env = params.env;
  if (params.region) query.region = params.region;
  if (params.suspended) query.suspended = params.suspended;
  if (params.createdBefore) query.createdBefore = params.createdBefore;
  if (params.createdAfter) query.createdAfter = params.createdAfter;
  if (params.updatedBefore) query.updatedBefore = params.updatedBefore;
  if (params.updatedAfter) query.updatedAfter = params.updatedAfter;
  if (params.ownerId) {
    query.ownerId = Array.isArray(params.ownerId) ? params.ownerId.join(',') : params.ownerId;
  }
  if (params.includePreviews !== undefined) query.includePreviews = params.includePreviews;
  if (params.cursor) query.cursor = params.cursor;
  if (params.limit) query.limit = params.limit;

  return query;
}

/**
 * Services resource client
 *
 * Manage web services, private services, background workers, cron jobs, and static sites.
 */
export class ServicesResource extends BaseResource {
  /**
   * Deploys sub-resource
   */
  public readonly deploys: DeploysResource;

  /**
   * Custom domains sub-resource
   */
  public readonly customDomains: CustomDomainsResource;

  /**
   * Environment variables sub-resource
   */
  public readonly envVars: ServiceEnvVarsResource;

  /**
   * Secret files sub-resource
   */
  public readonly secretFiles: ServiceSecretFilesResource;

  /**
   * Headers sub-resource (static sites only)
   */
  public readonly headers: HeadersResource;

  /**
   * Routes sub-resource (static sites only)
   */
  public readonly routes: RoutesResource;

  /**
   * One-off jobs sub-resource
   */
  public readonly jobs: JobsResource;

  constructor(http: HttpClient) {
    super(http);
    this.deploys = new DeploysResource(http);
    this.customDomains = new CustomDomainsResource(http);
    this.envVars = new ServiceEnvVarsResource(http);
    this.secretFiles = new ServiceSecretFilesResource(http);
    this.headers = new HeadersResource(http);
    this.routes = new RoutesResource(http);
    this.jobs = new JobsResource(http);
  }

  /**
   * List services matching the provided filters
   *
   * @param params - Filter and pagination parameters
   * @returns Paginated list of services
   *
   * @example
   * ```ts
   * const { items, hasMore, cursor } = await client.services.list({
   *   type: 'web_service',
   *   limit: 10
   * });
   * ```
   */
  async list(params?: ListServicesParams): Promise<PaginatedResponse<Service>> {
    const query = buildListQuery(params);
    const response = await this.http.get<ServiceWithCursor[]>('/services', query);

    const validated = this.validateArray(ServiceWithCursorSchema, response.data);

    // Transform to standard cursor response format
    const items: CursorResponse<Service>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.service,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all pages of services
   *
   * @param params - Filter and pagination parameters
   * @yields Service objects one at a time
   *
   * @example
   * ```ts
   * for await (const service of client.services.listAll({ type: 'web_service' })) {
   *   console.log(service.name);
   * }
   * ```
   */
  async *listAll(
    params?: ListServicesParams & AutoPaginateOptions
  ): AsyncGenerator<Service, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query = buildListQuery({ ...restParams, cursor, limit });
      const response = await this.http.get<ServiceWithCursor[]>('/services', query);
      const validated = this.validateArray(ServiceWithCursorSchema, response.data);

      if (validated.length === 0) {
        break;
      }

      for (const item of validated) {
        yield item.service;
        totalFetched++;

        if (maxItems !== undefined && totalFetched >= maxItems) {
          return;
        }
      }

      cursor = extractCursor(
        validated.map((v) => ({ cursor: v.cursor, item: v.service }))
      );

      if (!cursor) {
        break;
      }
    }
  }

  /**
   * Create a new service
   *
   * @param input - Service configuration
   * @returns The created service and initial deploy ID
   *
   * @example
   * ```ts
   * const { service, deployId } = await client.services.create({
   *   type: 'web_service',
   *   name: 'my-api',
   *   ownerId: 'tea-xxxxx',
   *   repo: 'https://github.com/user/repo',
   *   serviceDetails: {
   *     runtime: 'node',
   *     plan: 'starter',
   *     region: 'oregon',
   *     envSpecificDetails: {
   *       buildCommand: 'npm install',
   *       startCommand: 'npm start',
   *     },
   *   },
   * });
   * ```
   */
  async create(input: CreateServiceInput): Promise<ServiceAndDeploy> {
    const validated = this.validate(CreateServiceInputSchema, input);
    const response = await this.http.post<ServiceAndDeploy>('/services', validated);
    return this.validate(ServiceAndDeploySchema, response.data);
  }

  /**
   * Retrieve a service by ID
   *
   * @param serviceId - The service ID
   * @returns The service
   *
   * @example
   * ```ts
   * const service = await client.services.retrieve('srv-xxxxx');
   * ```
   */
  async retrieve(serviceId: string): Promise<Service> {
    const response = await this.http.get<Service>(`/services/${serviceId}`);
    return this.validate(ServiceSchema, response.data);
  }

  /**
   * Update a service
   *
   * @param serviceId - The service ID
   * @param input - Fields to update
   * @returns The updated service
   *
   * @example
   * ```ts
   * const service = await client.services.update('srv-xxxxx', {
   *   name: 'new-name',
   *   autoDeploy: 'no',
   * });
   * ```
   */
  async update(serviceId: string, input: UpdateServiceInput): Promise<Service> {
    const validated = this.validate(UpdateServiceInputSchema, input);
    const response = await this.http.patch<Service>(`/services/${serviceId}`, validated);
    return this.validate(ServiceSchema, response.data);
  }

  /**
   * Delete a service
   *
   * @param serviceId - The service ID
   *
   * @example
   * ```ts
   * await client.services.delete('srv-xxxxx');
   * ```
   */
  async delete(serviceId: string): Promise<void> {
    await this.http.delete(`/services/${serviceId}`);
  }

  /**
   * Suspend a service
   *
   * Suspending a service stops all running instances and prevents new deploys.
   *
   * @param serviceId - The service ID
   *
   * @example
   * ```ts
   * await client.services.suspend('srv-xxxxx');
   * ```
   */
  async suspend(serviceId: string): Promise<void> {
    await this.http.post(`/services/${serviceId}/suspend`);
  }

  /**
   * Resume a suspended service
   *
   * @param serviceId - The service ID
   *
   * @example
   * ```ts
   * await client.services.resume('srv-xxxxx');
   * ```
   */
  async resume(serviceId: string): Promise<void> {
    await this.http.post(`/services/${serviceId}/resume`);
  }

  /**
   * Restart a service
   *
   * This triggers a restart of all running instances without a new deploy.
   *
   * @param serviceId - The service ID
   *
   * @example
   * ```ts
   * await client.services.restart('srv-xxxxx');
   * ```
   */
  async restart(serviceId: string): Promise<void> {
    await this.http.post(`/services/${serviceId}/restart`);
  }

  /**
   * Scale a service to a specific number of instances
   *
   * @param serviceId - The service ID
   * @param input - Scale configuration
   * @returns The updated service
   *
   * @example
   * ```ts
   * const service = await client.services.scale('srv-xxxxx', { numInstances: 3 });
   * ```
   */
  async scale(serviceId: string, input: ScaleServiceInput): Promise<Service> {
    const validated = this.validate(ScaleServiceInputSchema, input);
    const response = await this.http.post<Service>(`/services/${serviceId}/scale`, validated);
    return this.validate(ServiceSchema, response.data);
  }

  /**
   * Configure autoscaling for a service
   *
   * @param serviceId - The service ID
   * @param input - Autoscaling configuration
   *
   * @example
   * ```ts
   * await client.services.autoscale('srv-xxxxx', {
   *   enabled: true,
   *   min: 1,
   *   max: 10,
   *   criteria: {
   *     cpu: { enabled: true, percentage: 70 },
   *     memory: { enabled: true, percentage: 80 },
   *   },
   * });
   * ```
   */
  async autoscale(serviceId: string, input: AutoscalingInput): Promise<void> {
    const validated = this.validate(AutoscalingInputSchema, input);
    await this.http.put(`/services/${serviceId}/autoscaling`, validated);
  }

  /**
   * Delete autoscaling configuration for a service
   *
   * This reverts the service to manual scaling.
   *
   * @param serviceId - The service ID
   *
   * @example
   * ```ts
   * await client.services.deleteAutoscaling('srv-xxxxx');
   * ```
   */
  async deleteAutoscaling(serviceId: string): Promise<void> {
    await this.http.delete(`/services/${serviceId}/autoscaling`);
  }

  /**
   * Create a preview instance of a service
   *
   * @param serviceId - The service ID
   * @param input - Preview configuration
   * @returns The preview service and deploy ID
   *
   * @example
   * ```ts
   * const { service, deployId } = await client.services.preview('srv-xxxxx', {
   *   name: 'my-preview',
   * });
   * ```
   */
  async preview(serviceId: string, input?: PreviewServiceInput): Promise<ServiceAndDeploy> {
    const validated = input ? this.validate(PreviewServiceInputSchema, input) : undefined;
    const response = await this.http.post<ServiceAndDeploy>(
      `/services/${serviceId}/preview`,
      validated
    );
    return this.validate(ServiceAndDeploySchema, response.data);
  }

  /**
   * Purge the CDN cache for a static site
   *
   * @param serviceId - The service ID (must be a static site)
   *
   * @example
   * ```ts
   * await client.services.purgeCache('srv-xxxxx');
   * ```
   */
  async purgeCache(serviceId: string): Promise<void> {
    await this.http.post(`/services/${serviceId}/cache/purge`);
  }

  /**
   * List running instances for a service
   *
   * @param serviceId - The service ID
   * @returns List of service instances
   *
   * @example
   * ```ts
   * const instances = await client.services.listInstances('srv-xxxxx');
   * ```
   */
  async listInstances(serviceId: string): Promise<ServiceInstance[]> {
    const response = await this.http.get<ServiceInstance[]>(`/services/${serviceId}/instances`);
    return this.validateArray(ServiceInstanceSchema, response.data);
  }
}
