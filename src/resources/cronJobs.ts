import { BaseResource } from './base.js';

/**
 * Cron Jobs resource client
 *
 * Manage cron job runs (separate from the service management).
 */
export class CronJobsResource extends BaseResource {
  /**
   * Trigger a cron job run
   */
  async run(cronJobId: string): Promise<void> {
    await this.http.post(`/cron-jobs/${cronJobId}/runs`);
  }

  /**
   * Cancel a running cron job
   */
  async cancel(cronJobId: string): Promise<void> {
    await this.http.delete(`/cron-jobs/${cronJobId}/runs`);
  }
}
