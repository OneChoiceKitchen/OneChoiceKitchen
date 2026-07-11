/** Admin permission names used with PermissionsGuard */
export const PERMISSIONS = {
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_NOTIFICATIONS: 'manage_notifications',
  MANAGE_PAYMENTS: 'manage_payments',
  MANAGE_USERS: 'manage_users',
  MANAGE_CONTENT: 'manage_content',
} as const;

export const ADMIN_PERMISSION_NAMES = Object.values(PERMISSIONS);
