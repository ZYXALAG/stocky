// Alert type definitions for the Low Stock Alerts system

export interface Alert {
  id: string;
  product_id: string | null;
  product_name: string | null;
  product_photo_url: string | null;
  current_quantity: number;
  threshold: number;
  acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'notice';

export interface AlertSettings {
  global_threshold: number;
  email_notifications: boolean;
  user_id: string;
}

export interface AlertWithProduct extends Alert {
  product: {
    id: string;
    name: string;
    photo_url: string | null;
  } | null;
}

/**
 * Determine severity based on quantity vs threshold.
 * - 'critical': qty <= threshold * 0.25
 * - 'warning': qty <= threshold * 0.5
 * - 'notice': qty <= threshold (but above 50%)
 */
export function getAlertSeverity(quantity: number, threshold: number): AlertSeverity {
  if (threshold <= 0) return 'notice';
  const ratio = quantity / threshold;
  if (ratio <= 0.25) return 'critical';
  if (ratio <= 0.5) return 'warning';
  return 'notice';
}

/**
 * Return Tailwind color classes for severity badge.
 */
export function getAlertSeverityColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    critical: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    notice: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  };
  return colors[severity];
}

/**
 * Return the severity label in French.
 */
export function getAlertSeverityLabel(severity: AlertSeverity): string {
  const labels: Record<AlertSeverity, string> = {
    critical: 'Critique',
    warning: 'Attention',
    notice: 'Notice',
  };
  return labels[severity];
}
