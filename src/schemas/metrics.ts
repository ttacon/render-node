import { z } from 'zod';

// ============================================================================
// Metrics
// ============================================================================

export const MetricDataPointSchema = z.object({
  timestamp: z.string(),
  value: z.number(),
});
export type MetricDataPoint = z.infer<typeof MetricDataPointSchema>;

export const MetricSeriesSchema = z.object({
  labels: z.record(z.string()).optional(),
  values: z.array(MetricDataPointSchema),
});
export type MetricSeries = z.infer<typeof MetricSeriesSchema>;

export const MetricResponseSchema = z.object({
  series: z.array(MetricSeriesSchema),
});
export type MetricResponse = z.infer<typeof MetricResponseSchema>;

export interface MetricsParams {
  resourceIds: string[];
  startTime?: string;
  endTime?: string;
  step?: string;
  instanceId?: string;
}

export interface BandwidthSourcesParams extends MetricsParams {
  aggregateBy?: 'host' | 'path' | 'statusCode';
}

export interface HttpMetricsParams extends MetricsParams {
  host?: string;
  statusCode?: string;
  path?: string;
}
