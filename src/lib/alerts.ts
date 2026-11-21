import { createClient } from '@/lib/supabase/client';
import type { Alert, AlertSettings } from '@/types/alert';
import { getAlertSeverity } from '@/types/alert';

/**
 * Check all products where current quantity (base_quantity) <= alert_threshold.
 * Returns alerts with severity computed.
 */
export async function checkLowStockProducts(userId: string): Promise<Alert[]> {
  const supabase = createClient();

  // Fetch products below threshold
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, photo_url, base_quantity, alert_threshold')
    .lte('base_quantity', 'alert_threshold')
    .gt('alert_threshold', 0)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!products || products.length === 0) return [];

  // Upsert alerts for each low-stock product
  const alerts: Alert[] = [];
  for (const product of products) {
    const severity = getAlertSeverity(product.base_quantity, product.alert_threshold);

    // Check if alert already exists (upsert)
    const { data: existing, error: fetchErr } = await supabase
      .from('alerts')
      .select('*')
      .eq('product_id', product.id)
      .is('acknowledged', false)
      .single();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.error('Failed to fetch existing alert:', fetchErr);
      continue;
    }

    if (existing) {
      // Update existing alert
      const { error: updateErr } = await supabase
        .from('alerts')
        .update({
          current_quantity: product.base_quantity,
          threshold: product.alert_threshold,
          product_name: product.name,
          product_photo_url: product.photo_url,
        })
        .eq('id', existing.id);
      if (updateErr) console.error('Failed to update alert:', updateErr);
    } else {
      // Create new alert
      const { data: newAlert, error: createErr } = await supabase
        .from('alerts')
        .insert({
          product_id: product.id,
          product_name: product.name,
          product_photo_url: product.photo_url,
          current_quantity: product.base_quantity,
          threshold: product.alert_threshold,
          acknowledged: false,
        })
        .select()
        .single();
      if (createErr) {
        console.error('Failed to create alert:', createErr);
        continue;
      }
      if (newAlert) {
        alerts.push({
          id: newAlert.id,
          product_id: newAlert.product_id,
          product_name: newAlert.product_name,
          product_photo_url: newAlert.product_photo_url,
          current_quantity: newAlert.current_quantity,
          threshold: newAlert.threshold,
          acknowledged: false,
          acknowledged_at: null,
          created_at: newAlert.created_at,
        });
      }
    }
  }

  // Also return alerts that already exist in DB
  const { data: dbAlerts, error: dbErr } = await supabase
    .from('alerts')
    .select('*')
    .is('acknowledged', false)
    .order('created_at', { ascending: false });

  if (dbErr) {
    console.error('Failed to fetch alerts:', dbErr);
  }

  // Merge and deduplicate
  const existingIds = new Set(alerts.map((a) => a.id));
  const merged = [
    ...alerts,
    ...(dbAlerts || []).filter((a: any) => !existingIds.has(a.id)),
  ];

  return merged;
}

/**
 * Acknowledge a single alert.
 */
export async function acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('alerts')
    .update({
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', alertId);

  if (error) {
    console.error('Failed to acknowledge alert:', error);
    return false;
  }
  return true;
}

/**
 * Acknowledge all unacknowledged alerts for the user's products.
 */
export async function acknowledgeAllAlerts(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('alerts')
    .update({
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
    })
    .is('acknowledged', false)
    .select('count');

  if (error) {
    console.error('Failed to acknowledge all alerts:', error);
    return 0;
  }
  return count || 0;
}

/**
 * Get the count of unacknowledged (active) alerts.
 */
export async function getAlertCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .is('acknowledged', false);

  if (error) {
    console.error('Failed to get alert count:', error);
    return 0;
  }
  return count || 0;
}

/**
 * Fetch all alerts (active + acknowledged) with product info.
 */
export async function getAllAlerts(userId: string): Promise<Alert[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch all alerts:', error);
    return [];
  }

  return (data || []).map((a: any) => ({
    id: a.id,
    product_id: a.product_id,
    product_name: a.product_name,
    product_photo_url: a.product_photo_url,
    current_quantity: a.current_quantity,
    threshold: a.threshold,
    acknowledged: a.acknowledged,
    acknowledged_at: a.acknowledged_at,
    created_at: a.created_at,
  }));
}

/**
 * Upsert an alert for a specific product after a stock movement.
 */
export async function createOrUpdateAlert(
  productId: string,
  productName: string,
  productPhotoUrl: string | null,
  quantity: number,
  threshold: number
): Promise<void> {
  if (threshold <= 0 || quantity > threshold) return;

  const supabase = createClient();

  // Check if alert already exists
  const { data: existing } = await supabase
    .from('alerts')
    .select('id')
    .eq('product_id', productId)
    .is('acknowledged', false)
    .single();

  if (existing) {
    // Update existing
    await supabase
      .from('alerts')
      .update({
        current_quantity: quantity,
        threshold: threshold,
        product_name: productName,
        product_photo_url: productPhotoUrl,
      })
      .eq('id', existing.id);
  } else {
    // Create new
    await supabase.from('alerts').insert({
      product_id: productId,
      product_name: productName,
      product_photo_url: productPhotoUrl,
      current_quantity: quantity,
      threshold: threshold,
      acknowledged: false,
    });
  }
}

/**
 * Fetch alert settings for the user.
 */
export async function getAlertSettings(userId: string): Promise<AlertSettings | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('alert_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // Settings don't exist yet — create defaults
    if (error.code === 'PGRST116') {
      const defaults: Omit<AlertSettings, 'user_id'> = {
        global_threshold: 10,
        email_notifications: true,
      };
      const { data: created, error: createErr } = await supabase
        .from('alert_settings')
        .insert({ user_id: userId, ...defaults })
        .select()
        .single();
      if (createErr) {
        console.error('Failed to create default alert settings:', createErr);
        return { user_id: userId, ...defaults };
      }
      return { user_id: userId, ...created };
    }
    console.error('Failed to fetch alert settings:', error);
    return null;
  }

  return {
    user_id: data.user_id,
    global_threshold: data.global_threshold,
    email_notifications: data.email_notifications,
  };
}

/**
 * Save alert settings.
 */
export async function saveAlertSettings(
  userId: string,
  globalThreshold: number,
  emailNotifications: boolean
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('alert_settings')
    .upsert(
      {
        user_id: userId,
        global_threshold: globalThreshold,
        email_notifications: emailNotifications,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('Failed to save alert settings:', error);
    return false;
  }
  return true;
}
