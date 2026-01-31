// Main client
export { RenderClient, type RenderClientOptions } from './client.js';

// Errors
export {
  RenderError,
  RenderApiError,
  RenderBadRequestError,
  RenderAuthError,
  RenderPaymentRequiredError,
  RenderForbiddenError,
  RenderNotFoundError,
  RenderNotAcceptableError,
  RenderConflictError,
  RenderGoneError,
  RenderRateLimitError,
  RenderServerError,
  RenderServiceUnavailableError,
  RenderNetworkError,
  RenderTimeoutError,
  RenderValidationError,
  type RenderErrorResponse,
} from './errors.js';

// Pagination
export type {
  PaginationParams,
  CursorResponse,
  PaginatedResponse,
  AutoPaginateOptions,
} from './pagination.js';

// Common schemas and types
export {
  RegionSchema,
  PlanSchema,
  PaidPlanSchema,
  BuildPlanSchema,
  ServiceTypeSchema,
  ServiceRuntimeSchema,
  AutoDeploySchema,
  NotifySettingSchema,
  SuspenderTypeSchema,
  SuspendedStatusSchema,
  ProtectedStatusSchema,
  DeployStatusSchema,
  DeployTriggerSchema,
  type Region,
  type Plan,
  type PaidPlan,
  type BuildPlan,
  type ServiceType,
  type ServiceRuntime,
  type AutoDeploy,
  type NotifySetting,
  type SuspenderType,
  type SuspendedStatus,
  type ProtectedStatus,
  type DeployStatus,
  type DeployTrigger,
  type EnvVar,
  type EnvVarInput,
  type SecretFile,
  type SecretFileInput,
} from './schemas/common.js';

// Service types
export type {
  Service,
  ServiceAndDeploy,
  CreateServiceInput,
  UpdateServiceInput,
  ListServicesParams,
  ScaleServiceInput,
  AutoscalingInput,
  ServiceInstance,
  PreviewServiceInput,
  WebServiceDetails,
  PrivateServiceDetails,
  BackgroundWorkerDetails,
  StaticSiteDetails,
  CronJobDetails,
} from './schemas/services.js';

// Deploy types
export type {
  Deploy,
  CreateDeployInput,
  RollbackDeployInput,
  ListDeploysParams,
} from './schemas/deploys.js';

// Custom Domain types
export type {
  CustomDomain,
  CreateCustomDomainInput,
  ListCustomDomainsParams,
} from './schemas/customDomains.js';

// Header types
export type { Header, HeaderInput, ListHeadersParams } from './schemas/headers.js';

// Route types
export type { Route, RouteInput, RoutePatchInput, ListRoutesParams } from './schemas/routes.js';

// Job types
export type { Job, CreateJobInput, ListJobsParams } from './schemas/jobs.js';

// Postgres types
export {
  PostgresPlanSchema,
  PostgresVersionSchema,
  type Postgres,
  type PostgresConnectionInfo,
  type CreatePostgresInput,
  type UpdatePostgresInput,
  type PostgresUser,
  type CreatePostgresUserInput,
  type PostgresRecoveryInfo,
  type RecoverPostgresInput,
  type PostgresExport,
  type ListPostgresParams,
  type PostgresPlan,
  type PostgresVersion,
} from './schemas/postgres.js';

// Key Value types
export {
  KeyValuePlanSchema,
  type KeyValue,
  type KeyValueConnectionInfo,
  type CreateKeyValueInput,
  type UpdateKeyValueInput,
  type ListKeyValueParams,
  type KeyValuePlan,
} from './schemas/keyValue.js';

// Redis types (deprecated)
export type {
  Redis,
  RedisConnectionInfo,
  CreateRedisInput,
  UpdateRedisInput,
  ListRedisParams,
} from './schemas/redis.js';

// Disk types
export type {
  Disk,
  CreateDiskInput,
  UpdateDiskInput,
  DiskSnapshot,
  RestoreSnapshotInput,
  ListDisksParams,
} from './schemas/disks.js';

// Environment Group types
export type {
  EnvGroup,
  CreateEnvGroupInput,
  UpdateEnvGroupInput,
  ListEnvGroupsParams,
} from './schemas/envGroups.js';

// Project types
export type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsParams,
} from './schemas/projects.js';

// Environment types
export type {
  Environment,
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
  AddResourcesInput,
  RemoveResourcesInput,
  ListEnvironmentsParams,
} from './schemas/environments.js';

// Blueprint types
export type {
  Blueprint,
  BlueprintSync,
  UpdateBlueprintInput,
  ListBlueprintsParams,
} from './schemas/blueprints.js';

// Registry Credential types
export {
  RegistryTypeSchema,
  type RegistryCredentialFull,
  type CreateRegistryCredentialInput,
  type UpdateRegistryCredentialInput,
  type ListRegistryCredentialsParams,
  type RegistryType,
} from './schemas/registryCredentials.js';

// Webhook types
export type {
  Webhook,
  WebhookEvent,
  CreateWebhookInput,
  UpdateWebhookInput,
  ListWebhooksParams,
} from './schemas/webhooks.js';

// Workspace types
export {
  TeamMemberRoleSchema,
  type Workspace,
  type TeamMember,
  type UpdateTeamMemberInput,
  type ListWorkspacesParams,
  type TeamMemberRole,
} from './schemas/workspaces.js';

// User types
export type { User } from './schemas/users.js';

// Log types
export type { LogEntry, ListLogsParams } from './schemas/logs.js';

// Metric types
export type {
  MetricDataPoint,
  MetricSeries,
  MetricResponse,
  MetricsParams,
  BandwidthSourcesParams,
  HttpMetricsParams,
} from './schemas/metrics.js';

// Maintenance types
export type {
  MaintenanceRun,
  UpdateMaintenanceInput,
  ListMaintenanceParams,
} from './schemas/maintenance.js';

// Notification Settings types
export type {
  NotificationSettings,
  NotificationOverride,
  UpdateNotificationSettingsInput,
  UpdateNotificationOverrideInput,
} from './schemas/notificationSettings.js';

// Audit Log types
export type { AuditLog, ListAuditLogsParams } from './schemas/auditLogs.js';

// Event types
export type { Event } from './schemas/events.js';
