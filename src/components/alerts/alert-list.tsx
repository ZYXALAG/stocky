'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Bell, Check, CheckCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDateRelative } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  acknowledgeAlert,
  acknowledgeAllAlerts,
  checkLowStockProducts,
} from '@/lib/alerts';
import type { Alert, AlertSeverity, AlertWithProduct } from '@/types/alert';
import { getAlertSeverity, getAlertSeverityColor, getAlertSeverityLabel } from '@/types/alert';

type FilterMode = 'active' | 'all' | 'acknowledged';

interface AlertListProps {
  filter?: FilterMode;
}

export function AlertList({ filter = 'active' }: AlertListProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // First, run the check to upsert any new alerts
      await checkLowStockProducts('');

      // Fetch alerts
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data || []) as Alert[]);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const filteredAlerts = alerts.filter((a) => {
    // Apply filter mode
    if (filter === 'active' && a.acknowledged) return false;
    if (filter === 'acknowledged' && !a.acknowledged) return false;

    // Apply search
    if (search) {
      const q = search.toLowerCase();
      return (
        (a.product_name || '').toLowerCase().includes(q) ||
        String(a.current_quantity).includes(q)
      );
    }
    return true;
  });

  const handleAcknowledge = async (alertId: string) => {
    const success = await acknowledgeAlert(alertId, '');
    if (success) {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, acknowledged: true, acknowledged_at: new Date().toISOString() }
            : a
        )
      );
      toast({
        title: 'Alerte acquittée',
        description: 'L\'alerte a été marquée comme acquittée.',
      });
    } else {
      toast({ title: 'Erreur', description: 'Échec de l\'acquittement.', variant: 'destructive' });
    }
  };

  const handleAcknowledgeAll = async () => {
    const activeCount = alerts.filter((a) => !a.acknowledged).length;
    if (activeCount === 0) return;

    const success = await acknowledgeAllAlerts('');
    if (success > 0) {
      setAlerts((prev) =>
        prev.map((a) => ({
          ...a,
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        }))
      );
      toast({
        title: 'Toutes les alertes acquittées',
        description: `${success} alerte${success > 1 ? 's' : ''} acquittée${success > 1 ? 's' : ''}.`,
      });
    } else {
      toast({ title: 'Erreur', description: 'Échec de l\'acquittement global.', variant: 'destructive' });
    }
  };

  const activeCount = alerts.filter((a) => !a.acknowledged).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une alerte..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">
              {activeCount} active{activeCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Acknowledge All button */}
        {activeCount > 0 && (
          <Button size="sm" variant="outline" onClick={handleAcknowledgeAll}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Tout acquitter
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      {/* Alert list */}
      {filteredAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="mb-4 h-12 w-12 opacity-30" />
          <p className="text-lg font-medium">
            {filter === 'acknowledged'
              ? 'Aucune alerte acquittée'
              : search
              ? 'Aucune alerte trouvée'
              : 'Aucune alerte'}
          </p>
          <p className="text-sm">
            {filter === 'active' && activeCount === 0
              ? 'Tous les stocks sont au-dessus des seuils.'
              : 'Les alertes de stock bas apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const severity = getAlertSeverity(
              alert.current_quantity,
              alert.threshold
            );
            const severityColor = getAlertSeverityColor(severity);
            const daysSince = alert.created_at
              ? Math.floor(
                  (Date.now() - new Date(alert.created_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : 0;

            return (
              <div
                key={alert.id}
                className={`flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors ${
                  !alert.acknowledged ? 'hover:border-primary/50' : 'opacity-60'
                }`}
              >
                {/* Product photo */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                  {alert.product_photo_url ? (
                    <img
                      src={alert.product_photo_url}
                      alt={alert.product_name || 'Produit'}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-lg">📦</span>
                  )}
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {alert.product_name || 'Produit inconnu'}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${severityColor}`}
                    >
                      {getAlertSeverityLabel(severity)}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      Quantité: <strong className="text-foreground">{alert.current_quantity}</strong> /{' '}
                      Seuil: <strong className="text-foreground">{alert.threshold}</strong>
                    </span>
                    <span>
                      {daysSince === 0
                        ? 'Aujourd\'hui'
                        : daysSince === 1
                        ? 'Hier'
                        : `${daysSince}j`}
                    </span>
                    {alert.acknowledged_at && (
                      <span className="text-muted-foreground">
                        Acquittée {formatDateRelative(alert.acknowledged_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Acknowledge button */}
                {!alert.acknowledged && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAcknowledge(alert.id)}
                    className="text-xs h-7"
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Acquitter
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
