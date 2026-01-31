import { z } from 'zod';

// ============================================================================
// Notification Settings
// ============================================================================

export const NotificationSettingsSchema = z.object({
  ownerId: z.string(),
  emailEnabled: z.boolean().optional(),
  slackEnabled: z.boolean().optional(),
  slackWebhookUrl: z.string().optional(),
  previewsEnabled: z.boolean().optional(),
});
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

export const NotificationOverrideSchema = z.object({
  serviceId: z.string(),
  emailEnabled: z.boolean().optional(),
  slackEnabled: z.boolean().optional(),
  previewsEnabled: z.boolean().optional(),
});
export type NotificationOverride = z.infer<typeof NotificationOverrideSchema>;

export const NotificationOverrideWithCursorSchema = z.object({
  notificationOverride: NotificationOverrideSchema,
  cursor: z.string(),
});
export type NotificationOverrideWithCursor = z.infer<typeof NotificationOverrideWithCursorSchema>;

export const UpdateNotificationSettingsInputSchema = z.object({
  emailEnabled: z.boolean().optional(),
  slackEnabled: z.boolean().optional(),
  slackWebhookUrl: z.string().optional(),
  previewsEnabled: z.boolean().optional(),
});
export type UpdateNotificationSettingsInput = z.infer<typeof UpdateNotificationSettingsInputSchema>;

export const UpdateNotificationOverrideInputSchema = z.object({
  emailEnabled: z.boolean().optional(),
  slackEnabled: z.boolean().optional(),
  previewsEnabled: z.boolean().optional(),
});
export type UpdateNotificationOverrideInput = z.infer<typeof UpdateNotificationOverrideInputSchema>;
