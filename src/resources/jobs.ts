import type { AutoPaginateOptions, CursorResponse, PaginatedResponse } from '../pagination.js';
import { createPaginatedResponse, extractCursor } from '../pagination.js';
import {
  type CreateJobInput,
  CreateJobInputSchema,
  type Job,
  JobSchema,
  type JobWithCursor,
  JobWithCursorSchema,
  type ListJobsParams,
} from '../schemas/jobs.js';
import { BaseResource } from './base.js';

/**
 * Build query parameters for list jobs endpoint
 */
function buildListQuery(
  params?: ListJobsParams,
): Record<string, string | number | boolean | undefined> {
  if (!params) return {};

  const query: Record<string, string | number | boolean | undefined> = {};

  if (params.status) query.status = params.status;
  if (params.createdBefore) query.createdBefore = params.createdBefore;
  if (params.createdAfter) query.createdAfter = params.createdAfter;
  if (params.startedBefore) query.startedBefore = params.startedBefore;
  if (params.startedAfter) query.startedAfter = params.startedAfter;
  if (params.finishedBefore) query.finishedBefore = params.finishedBefore;
  if (params.finishedAfter) query.finishedAfter = params.finishedAfter;
  if (params.cursor) query.cursor = params.cursor;
  if (params.limit) query.limit = params.limit;

  return query;
}

/**
 * Jobs resource client
 *
 * Manage one-off jobs for services.
 */
export class JobsResource extends BaseResource {
  /**
   * List jobs for a service
   *
   * @param serviceId - The service ID
   * @param params - Filter and pagination parameters
   * @returns Paginated list of jobs
   */
  async list(serviceId: string, params?: ListJobsParams): Promise<PaginatedResponse<Job>> {
    const query = buildListQuery(params);
    const response = await this.http.get<JobWithCursor[]>(`/services/${serviceId}/jobs`, query);

    const validated = this.validateArray(JobWithCursorSchema, response.data);

    const items: CursorResponse<Job>[] = validated.map((item) => ({
      cursor: item.cursor,
      item: item.job,
    }));

    return createPaginatedResponse(items, params?.limit);
  }

  /**
   * Async generator that automatically fetches all jobs
   */
  async *listAll(
    serviceId: string,
    params?: ListJobsParams & AutoPaginateOptions,
  ): AsyncGenerator<Job, void, unknown> {
    const { cursor: initialCursor, limit, maxItems, ...restParams } = params ?? {};
    let cursor = initialCursor;
    let totalFetched = 0;

    while (true) {
      const query = buildListQuery({ ...restParams, cursor, limit });
      const response = await this.http.get<JobWithCursor[]>(`/services/${serviceId}/jobs`, query);
      const validated = this.validateArray(JobWithCursorSchema, response.data);

      if (validated.length === 0) {
        break;
      }

      for (const item of validated) {
        yield item.job;
        totalFetched++;

        if (maxItems !== undefined && totalFetched >= maxItems) {
          return;
        }
      }

      cursor = extractCursor(validated.map((v) => ({ cursor: v.cursor, item: v.job })));

      if (!cursor) {
        break;
      }
    }
  }

  /**
   * Create a one-off job for a service
   *
   * @param serviceId - The service ID
   * @param input - Job configuration
   * @returns The created job
   */
  async create(serviceId: string, input: CreateJobInput): Promise<Job> {
    const validated = this.validate(CreateJobInputSchema, input);
    const response = await this.http.post<Job>(`/services/${serviceId}/jobs`, validated);
    return this.validate(JobSchema, response.data);
  }

  /**
   * Retrieve a job by ID
   *
   * @param serviceId - The service ID
   * @param jobId - The job ID
   * @returns The job
   */
  async retrieve(serviceId: string, jobId: string): Promise<Job> {
    const response = await this.http.get<Job>(`/services/${serviceId}/jobs/${jobId}`);
    return this.validate(JobSchema, response.data);
  }

  /**
   * Cancel a running job
   *
   * @param serviceId - The service ID
   * @param jobId - The job ID
   * @returns The cancelled job
   */
  async cancel(serviceId: string, jobId: string): Promise<Job> {
    const response = await this.http.post<Job>(`/services/${serviceId}/jobs/${jobId}/cancel`);
    return this.validate(JobSchema, response.data);
  }
}
