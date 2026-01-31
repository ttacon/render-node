import {
  type BandwidthSourcesParams,
  type HttpMetricsParams,
  type MetricResponse,
  MetricResponseSchema,
  type MetricsParams,
} from '../schemas/metrics.js';
import { BaseResource } from './base.js';

function buildMetricsQuery(
  params: MetricsParams,
): Record<string, string | number | boolean | undefined> {
  const query: Record<string, string | number | boolean | undefined> = {
    resourceIds: params.resourceIds.join(','),
  };
  if (params.startTime) query.startTime = params.startTime;
  if (params.endTime) query.endTime = params.endTime;
  if (params.step) query.step = params.step;
  if (params.instanceId) query.instanceId = params.instanceId;
  return query;
}

/**
 * Metrics resource client
 */
export class MetricsResource extends BaseResource {
  async cpu(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>('/metrics/cpu', buildMetricsQuery(params));
    return this.validate(MetricResponseSchema, response.data);
  }

  async cpuLimit(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>(
      '/metrics/cpu-limit',
      buildMetricsQuery(params),
    );
    return this.validate(MetricResponseSchema, response.data);
  }

  async cpuTarget(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>(
      '/metrics/cpu-target',
      buildMetricsQuery(params),
    );
    return this.validate(MetricResponseSchema, response.data);
  }

  async memory(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>(
      '/metrics/memory',
      buildMetricsQuery(params),
    );
    return this.validate(MetricResponseSchema, response.data);
  }

  async memoryLimit(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>(
      '/metrics/memory-limit',
      buildMetricsQuery(params),
    );
    return this.validate(MetricResponseSchema, response.data);
  }

  async memoryTarget(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>(
      '/metrics/memory-target',
      buildMetricsQuery(params),
    );
    return this.validate(MetricResponseSchema, response.data);
  }

  async bandwidth(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>(
      '/metrics/bandwidth',
      buildMetricsQuery(params),
    );
    return this.validate(MetricResponseSchema, response.data);
  }

  async bandwidthSources(params: BandwidthSourcesParams): Promise<MetricResponse> {
    const query = buildMetricsQuery(params);
    if (params.aggregateBy) query.aggregateBy = params.aggregateBy;
    const response = await this.http.get<MetricResponse>('/metrics/bandwidth-sources', query);
    return this.validate(MetricResponseSchema, response.data);
  }

  async httpRequests(params: HttpMetricsParams): Promise<MetricResponse> {
    const query = buildMetricsQuery(params);
    if (params.host) query.host = params.host;
    if (params.statusCode) query.statusCode = params.statusCode;
    if (params.path) query.path = params.path;
    const response = await this.http.get<MetricResponse>('/metrics/http-requests', query);
    return this.validate(MetricResponseSchema, response.data);
  }

  async httpLatency(params: HttpMetricsParams): Promise<MetricResponse> {
    const query = buildMetricsQuery(params);
    if (params.host) query.host = params.host;
    if (params.statusCode) query.statusCode = params.statusCode;
    if (params.path) query.path = params.path;
    const response = await this.http.get<MetricResponse>('/metrics/http-latency', query);
    return this.validate(MetricResponseSchema, response.data);
  }

  async diskUsage(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>(
      '/metrics/disk-usage',
      buildMetricsQuery(params),
    );
    return this.validate(MetricResponseSchema, response.data);
  }

  async diskCapacity(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>(
      '/metrics/disk-capacity',
      buildMetricsQuery(params),
    );
    return this.validate(MetricResponseSchema, response.data);
  }

  async instanceCount(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>(
      '/metrics/instance-count',
      buildMetricsQuery(params),
    );
    return this.validate(MetricResponseSchema, response.data);
  }

  async activeConnections(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>(
      '/metrics/active-connections',
      buildMetricsQuery(params),
    );
    return this.validate(MetricResponseSchema, response.data);
  }

  async replicationLag(params: MetricsParams): Promise<MetricResponse> {
    const response = await this.http.get<MetricResponse>(
      '/metrics/replication-lag',
      buildMetricsQuery(params),
    );
    return this.validate(MetricResponseSchema, response.data);
  }

  async applicationFilters(params: MetricsParams): Promise<unknown> {
    const response = await this.http.get<unknown>(
      '/metrics/filters/application',
      buildMetricsQuery(params),
    );
    return response.data;
  }

  async httpFilters(params: MetricsParams): Promise<unknown> {
    const response = await this.http.get<unknown>(
      '/metrics/filters/http',
      buildMetricsQuery(params),
    );
    return response.data;
  }

  async pathFilters(params: MetricsParams): Promise<unknown> {
    const response = await this.http.get<unknown>(
      '/metrics/filters/path',
      buildMetricsQuery(params),
    );
    return response.data;
  }
}
