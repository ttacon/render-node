import { HttpClient, type HttpClientOptions } from './http.js';
import { AuditLogsResource } from './resources/auditLogs.js';
import { BlueprintsResource } from './resources/blueprints.js';
import { CronJobsResource } from './resources/cronJobs.js';
import { DisksResource } from './resources/disks.js';
import { EnvGroupsResource } from './resources/envGroups.js';
import { EnvironmentsResource } from './resources/environments.js';
import { EventsResource } from './resources/events.js';
import { KeyValueResource } from './resources/keyValue.js';
import { LogsResource } from './resources/logs.js';
import { MaintenanceResource } from './resources/maintenance.js';
import { MetricsResource } from './resources/metrics.js';
import { NotificationSettingsResource } from './resources/notificationSettings.js';
import { PostgresResource } from './resources/postgres.js';
import { ProjectsResource } from './resources/projects.js';
import { RedisResource } from './resources/redis.js';
import { RegistryCredentialsResource } from './resources/registryCredentials.js';
import { ServicesResource } from './resources/services.js';
import { UsersResource } from './resources/users.js';
import { WebhooksResource } from './resources/webhooks.js';
import { WorkspacesResource } from './resources/workspaces.js';

/**
 * Options for creating a RenderClient
 */
export interface RenderClientOptions {
  /**
   * Your Render API key
   */
  apiKey: string;
  /**
   * Base URL for the Render API (defaults to https://api.render.com/v1)
   */
  baseUrl?: string;
  /**
   * Request timeout in milliseconds (defaults to 30000)
   */
  timeout?: number;
  /**
   * Maximum number of retries for failed requests (defaults to 3)
   */
  maxRetries?: number;
}

/**
 * Render API Client
 *
 * The main entry point for interacting with the Render API.
 * Uses the builder pattern to provide access to various resources.
 *
 * @example
 * ```ts
 * import { RenderClient } from 'render-api';
 *
 * const render = new RenderClient({ apiKey: process.env.RENDER_API_KEY });
 *
 * // List all services
 * const { items } = await render.services.list();
 *
 * // Create a new service
 * const { service, deployId } = await render.services.create({
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
 *
 * // Auto-pagination
 * for await (const svc of render.services.listAll()) {
 *   console.log(svc.name);
 * }
 *
 * // Nested resources
 * const deploys = await render.services.deploys.list(service.id);
 * ```
 */
export class RenderClient {
  private readonly http: HttpClient;

  /**
   * Services resource
   *
   * Manage web services, private services, background workers, cron jobs, and static sites.
   * Also provides access to nested resources: deploys, customDomains, envVars, secretFiles, headers, routes, jobs.
   */
  public readonly services: ServicesResource;

  /**
   * Postgres resource
   *
   * Manage Postgres databases including connection info, users, exports, and recovery.
   */
  public readonly postgres: PostgresResource;

  /**
   * Key Value resource
   *
   * Manage Key Value (Redis-compatible) instances.
   */
  public readonly keyValue: KeyValueResource;

  /**
   * Redis resource
   *
   * @deprecated Use keyValue instead. The Redis API is deprecated in favor of Key Value.
   */
  public readonly redis: RedisResource;

  /**
   * Disks resource
   *
   * Manage persistent disks and snapshots for services.
   */
  public readonly disks: DisksResource;

  /**
   * Environment Groups resource
   *
   * Manage environment variable groups that can be shared across services.
   */
  public readonly envGroups: EnvGroupsResource;

  /**
   * Projects resource
   *
   * Manage projects for organizing services.
   */
  public readonly projects: ProjectsResource;

  /**
   * Environments resource
   *
   * Manage environments (staging, production, etc.) within projects.
   */
  public readonly environments: EnvironmentsResource;

  /**
   * Blueprints resource
   *
   * Manage Infrastructure as Code blueprints.
   */
  public readonly blueprints: BlueprintsResource;

  /**
   * Registry Credentials resource
   *
   * Manage credentials for private Docker registries.
   */
  public readonly registryCredentials: RegistryCredentialsResource;

  /**
   * Webhooks resource
   *
   * Manage webhook configurations.
   */
  public readonly webhooks: WebhooksResource;

  /**
   * Workspaces resource
   *
   * Manage workspaces (owners) and team members.
   */
  public readonly workspaces: WorkspacesResource;

  /**
   * Users resource
   *
   * Get authenticated user information.
   */
  public readonly users: UsersResource;

  /**
   * Logs resource
   *
   * Query logs for services and other resources.
   */
  public readonly logs: LogsResource;

  /**
   * Metrics resource
   *
   * Query CPU, memory, bandwidth, and other metrics.
   */
  public readonly metrics: MetricsResource;

  /**
   * Maintenance resource
   *
   * Manage scheduled maintenance runs.
   */
  public readonly maintenance: MaintenanceResource;

  /**
   * Notification Settings resource
   *
   * Manage notification preferences and overrides.
   */
  public readonly notificationSettings: NotificationSettingsResource;

  /**
   * Audit Logs resource
   *
   * Query audit logs for workspaces and organizations.
   */
  public readonly auditLogs: AuditLogsResource;

  /**
   * Events resource
   *
   * Retrieve events by ID.
   */
  public readonly events: EventsResource;

  /**
   * Cron Jobs resource
   *
   * Trigger and cancel cron job runs.
   */
  public readonly cronJobs: CronJobsResource;

  constructor(options: RenderClientOptions) {
    const httpOptions: HttpClientOptions = {
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      timeout: options.timeout,
      maxRetries: options.maxRetries,
    };

    this.http = new HttpClient(httpOptions);

    // Initialize all resources
    this.services = new ServicesResource(this.http);
    this.postgres = new PostgresResource(this.http);
    this.keyValue = new KeyValueResource(this.http);
    this.redis = new RedisResource(this.http);
    this.disks = new DisksResource(this.http);
    this.envGroups = new EnvGroupsResource(this.http);
    this.projects = new ProjectsResource(this.http);
    this.environments = new EnvironmentsResource(this.http);
    this.blueprints = new BlueprintsResource(this.http);
    this.registryCredentials = new RegistryCredentialsResource(this.http);
    this.webhooks = new WebhooksResource(this.http);
    this.workspaces = new WorkspacesResource(this.http);
    this.users = new UsersResource(this.http);
    this.logs = new LogsResource(this.http);
    this.metrics = new MetricsResource(this.http);
    this.maintenance = new MaintenanceResource(this.http);
    this.notificationSettings = new NotificationSettingsResource(this.http);
    this.auditLogs = new AuditLogsResource(this.http);
    this.events = new EventsResource(this.http);
    this.cronJobs = new CronJobsResource(this.http);
  }
}
