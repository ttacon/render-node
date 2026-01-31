import { BaseResource } from './base.js';
import type { PaginatedResponse, CursorResponse, AutoPaginateOptions } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  CustomDomainSchema,
  CustomDomainWithCursorSchema,
  CreateCustomDomainInputSchema,
  type CustomDomain,
  type CustomDomainWithCursor,
  type CreateCustomDomainInput,
  type ListCustomDomainsParams,
} from '../schemas/customDomains.js';

/**
 * Build query parameters for list custom domains endpoint
 */
function buildListQuery(
  params?: ListCustomDomainsParams
): Record<string, string | number | boolean | undefined> {
  if (!params) return {};

  const query: Record<string, string | number | boolean | undefined> = {};

  if (params.name) query.name = params.name;
  if (params.domainType) query.domainType = params.domainType;
  if (params.verificationStatus) query.verificationStatus = params.verificationStatus;
  if (params.createdBefore) query.createdBefore = params.createdBefore;
  if (params.createdAfter) query.createdAfter = params.createdAfter;
  if (params.cursor) query.cursor = params.cursor;
  if (params.limit) query.limit = params.limit;

  return query;
}

/**
 * Custom Domains resource client
 *
 * Manage custom domains for services.
 */
export class CustomDomainsResource extends BaseResource {
  /**
   * List custom domains for a service
   *
   * @param serviceId - The service ID
   * @param params - Filter and pagination parameters
   * @returns Paginated list of custom domains
   */
  async list(
    serviceId: string,
    params?: ListCustomDomainsParams
  ): Promise<PaginatedResponse<CustomDomain>> {
    const query = buildListQuery(params);
    const response = await this.http.get<CustomDomainWithCursor[]>(
      `/services/${serviceId}/custom-domains`,
      query
    );

    const validated = this.validateArray(CustomDomainWithCursorSchema, response.data);

    const items: CursorResponse<CustomDomain>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.customDomain,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all pages of custom domains
   */
  async *listAll(
    serviceId: string,
    params?: ListCustomDomainsParams & AutoPaginateOptions
  ): AsyncGenerator<CustomDomain, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query = buildListQuery({ ...restParams, cursor, limit });
      const response = await this.http.get<CustomDomainWithCursor[]>(
        `/services/${serviceId}/custom-domains`,
        query
      );
      const validated = this.validateArray(CustomDomainWithCursorSchema, response.data);

      if (validated.length === 0) {
        break;
      }

      for (const item of validated) {
        yield item.customDomain;
        totalFetched++;

        if (maxItems !== undefined && totalFetched >= maxItems) {
          return;
        }
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.customDomain })));

      if (!cursor) {
        break;
      }
    }
  }

  /**
   * Add a custom domain to a service
   *
   * @param serviceId - The service ID
   * @param input - Custom domain configuration
   * @returns The created custom domain
   */
  async create(serviceId: string, input: CreateCustomDomainInput): Promise<CustomDomain> {
    const validated = this.validate(CreateCustomDomainInputSchema, input);
    const response = await this.http.post<CustomDomain>(
      `/services/${serviceId}/custom-domains`,
      validated
    );
    return this.validate(CustomDomainSchema, response.data);
  }

  /**
   * Retrieve a custom domain by ID or name
   *
   * @param serviceId - The service ID
   * @param customDomainIdOrName - The custom domain ID or name
   * @returns The custom domain
   */
  async retrieve(serviceId: string, customDomainIdOrName: string): Promise<CustomDomain> {
    const response = await this.http.get<CustomDomain>(
      `/services/${serviceId}/custom-domains/${customDomainIdOrName}`
    );
    return this.validate(CustomDomainSchema, response.data);
  }

  /**
   * Delete a custom domain
   *
   * @param serviceId - The service ID
   * @param customDomainIdOrName - The custom domain ID or name
   */
  async delete(serviceId: string, customDomainIdOrName: string): Promise<void> {
    await this.http.delete(`/services/${serviceId}/custom-domains/${customDomainIdOrName}`);
  }

  /**
   * Verify a custom domain
   *
   * Triggers a verification check for the custom domain's DNS configuration.
   *
   * @param serviceId - The service ID
   * @param customDomainIdOrName - The custom domain ID or name
   * @returns The updated custom domain
   */
  async verify(serviceId: string, customDomainIdOrName: string): Promise<CustomDomain> {
    const response = await this.http.post<CustomDomain>(
      `/services/${serviceId}/custom-domains/${customDomainIdOrName}/verify`
    );
    return this.validate(CustomDomainSchema, response.data);
  }
}
