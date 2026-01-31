// Main client
export { RenderClient, type RenderClientOptions } from './client.js';

// Errors
export {
  RenderApiError,
  RenderAuthError,
  RenderBadRequestError,
  RenderConflictError,
  RenderError,
  type RenderErrorResponse,
  RenderForbiddenError,
  RenderGoneError,
  RenderNetworkError,
  RenderNotAcceptableError,
  RenderNotFoundError,
  RenderPaymentRequiredError,
  RenderRateLimitError,
  RenderServerError,
  RenderServiceUnavailableError,
  RenderTimeoutError,
  RenderValidationError,
} from './errors.js';

// Pagination
export type {
  AutoPaginateOptions,
  CursorResponse,
  PaginatedResponse,
  PaginationParams,
} from './pagination.js';
// Audit Log types
export type { AuditLog, ListAuditLogsParams } from './schemas/auditLogs.js';
// Blueprint types
export type {
  Blueprint,
  BlueprintSync,
  ListBlueprintsParams,
  UpdateBlueprintInput,
} from './schemas/blueprints.js';
// Common schemas and types
export {
  type AutoDeploy,
  AutoDeploySchema,
  type BuildPlan,
  BuildPlanSchema,
  type DeployStatus,
  DeployStatusSchema,
  type DeployTrigger,
  DeployTriggerSchema,
  type EnvVar,
  type EnvVarInput,
  type NotifySetting,
  NotifySettingSchema,
  type PaidPlan,
  PaidPlanSchema,
  type Plan,
  PlanSchema,
  type ProtectedStatus,
  ProtectedStatusSchema,
  type Region,
  RegionSchema,
  type SecretFile,
  type SecretFileInput,
  type ServiceRuntime,
  ServiceRuntimeSchema,
  type ServiceType,
  ServiceTypeSchema,
  type SuspendedStatus,
  SuspendedStatusSchema,
  type SuspenderType,
  SuspenderTypeSchema,
} from './schemas/common.js';

// Custom Domain types
export type {
  CreateCustomDomainInput,
  CustomDomain,
  ListCustomDomainsParams,
} from './schemas/customDomains.js';
// Deploy types
export type {
  CreateDeployInput,
  Deploy,
  ListDeploysParams,
  RollbackDeployInput,
} from './schemas/deploys.js';
// Disk types
export type {
  CreateDiskInput,
  Disk,
  DiskSnapshot,
  ListDisksParams,
  RestoreSnapshotInput,
  UpdateDiskInput,
} from './schemas/disks.js';
// Environment Group types
export type {
  CreateEnvGroupInput,
  EnvGroup,
  ListEnvGroupsParams,
  UpdateEnvGroupInput,
} from './schemas/envGroups.js';
// Environment types
export type {
  AddResourcesInput,
  CreateEnvironmentInput,
  Environment,
  ListEnvironmentsParams,
  RemoveResourcesInput,
  UpdateEnvironmentInput,
} from './schemas/environments.js';
// Event types
export type { RenderEvent } from './schemas/events.js';
// Header types
export type { Header, HeaderInput, ListHeadersParams } from './schemas/headers.js';
// Job types
export type { CreateJobInput, Job, ListJobsParams } from './schemas/jobs.js';
// Key Value types
export {
  type CreateKeyValueInput,
  type KeyValue,
  type KeyValueConnectionInfo,
  type KeyValuePlan,
  KeyValuePlanSchema,
  type ListKeyValueParams,
  type UpdateKeyValueInput,
} from './schemas/keyValue.js';
// Log types
export type { ListLogsParams, LogEntry } from './schemas/logs.js';
// Maintenance types
export type {
  ListMaintenanceParams,
  MaintenanceRun,
  UpdateMaintenanceInput,
} from './schemas/maintenance.js';
// Metric types
export type {
  BandwidthSourcesParams,
  HttpMetricsParams,
  MetricDataPoint,
  MetricResponse,
  MetricSeries,
  MetricsParams,
} from './schemas/metrics.js';
// Notification Settings types
export type {
  NotificationOverride,
  NotificationSettings,
  UpdateNotificationOverrideInput,
  UpdateNotificationSettingsInput,
} from './schemas/notificationSettings.js';
// Postgres types
export {
  type CreatePostgresInput,
  type CreatePostgresUserInput,
  type ListPostgresParams,
  type Postgres,
  type PostgresConnectionInfo,
  type PostgresExport,
  type PostgresPlan,
  PostgresPlanSchema,
  type PostgresRecoveryInfo,
  type PostgresUser,
  type PostgresVersion,
  PostgresVersionSchema,
  type RecoverPostgresInput,
  type UpdatePostgresInput,
} from './schemas/postgres.js';
// Project types
export type {
  CreateProjectInput,
  ListProjectsParams,
  Project,
  UpdateProjectInput,
} from './schemas/projects.js';
// Redis types (deprecated)
export type {
  CreateRedisInput,
  ListRedisParams,
  Redis,
  RedisConnectionInfo,
  UpdateRedisInput,
} from './schemas/redis.js';
// Registry Credential types
export {
  type CreateRegistryCredentialInput,
  type ListRegistryCredentialsParams,
  type RegistryCredentialFull,
  type RegistryType,
  RegistryTypeSchema,
  type UpdateRegistryCredentialInput,
} from './schemas/registryCredentials.js';
// Route types
export type { ListRoutesParams, Route, RouteInput, RoutePatchInput } from './schemas/routes.js';
// Service types
export type {
  AutoscalingInput,
  BackgroundWorkerDetails,
  CreateServiceInput,
  CronJobDetails,
  ListServicesParams,
  PreviewServiceInput,
  PrivateServiceDetails,
  ScaleServiceInput,
  Service,
  ServiceAndDeploy,
  ServiceInstance,
  StaticSiteDetails,
  UpdateServiceInput,
  WebServiceDetails,
} from './schemas/services.js';
// User types
export type { User } from './schemas/users.js';
// Webhook types
export type {
  CreateWebhookInput,
  ListWebhooksParams,
  UpdateWebhookInput,
  Webhook,
  WebhookEvent,
} from './schemas/webhooks.js';
// Workspace types
export {
  type ListWorkspacesParams,
  type TeamMember,
  type TeamMemberRole,
  TeamMemberRoleSchema,
  type UpdateTeamMemberInput,
  type Workspace,
} from './schemas/workspaces.js';
