'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDateRelative } from '@/lib/utils';
import { acknowledgeAlert } from '@/lib/alerts';
import type { Alert } from '@/types/alert';
import { getAlertSeverityColor } from '@/types/alert';

export function AlertBadge() {
  const [count, setCount] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .is('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setCount(data?.length || 0);
      setAlerts((data || []) as Alert[]);
    } catch (err) {
      console.error('Failed to fetch alert count:', err);
      setCount(0);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleAcknowledge = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await acknowledgeAlert(alertId, '');
    if (success) {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setCount((c) => Math.max(0, c - 1));
    }
  };

  const handleAcknowledgeAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts([]);
    setCount(0);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Alertes"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertes de stock
            </h3>
            {count > 0 && (
              <button
                onClick={handleAcknowledgeAll}
                className="text-xs text-primary hover:underline"
              >
                Tout acquitter
              </button>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Aucune alerte active
            </div>
          ) : (
            <div>
              {alerts.map((alert) => {
                const severityColor = getAlertSeverityColor(
                  'critical'
                ); // simplified; full severity needs quantity/threshold

                return (
                  <div
                    key={alert.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="h-8 w-8 flex-shrink-0 rounded bg-muted flex items-center justify-center">
                      {alert.product_photo_url ? (
                        <img
                          src={alert.product_photo_url}
                          alt={alert.product_name || ''}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <span className="text-sm">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {alert.product_name || 'Produit inconnu'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.current_quantity} / {alert.threshold} —{' '}
                        {formatDateRelative(alert.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleAcknowledge(alert.id, e)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Acquitter
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
