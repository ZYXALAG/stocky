'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Bell as BellIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { getAlertSettings, saveAlertSettings, checkLowStockProducts } from '@/lib/alerts';
import type { Product } from '@/types/product';
import type { AlertSettings as AlertSettingsType } from '@/types/alert';

export function AlertSettings() {
  const [settings, setSettings] = useState<AlertSettingsType | null>(null);
  const [globalThreshold, setGlobalThreshold] = useState('10');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch products with alert thresholds
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select('id, name, alert_threshold')
        .order('name');

      if (prodErr) throw prodErr;
      setProducts((prodData || []) as Product[]);

      // Fetch settings
      const settingsData = await getAlertSettings('');
      if (settingsData) {
        setSettings(settingsData);
        setGlobalThreshold(String(settingsData.global_threshold));
        setEmailNotifications(settingsData.email_notifications);
      }
    } catch (err) {
      console.error('Failed to fetch alert settings:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres d\'alerte.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const threshold = parseInt(globalThreshold, 10) || 10;
      const success = await saveAlertSettings('', threshold, emailNotifications);
      if (success) {
        setSettings({
          user_id: '',
          global_threshold: threshold,
          email_notifications: emailNotifications,
        });
        toast({
          title: 'Paramètres sauvegardés',
          description: 'Les paramètres d\'alerte ont été mis à jour.',
        });
      } else {
        toast({ title: 'Erreur', description: 'Échec de la sauvegarde.', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast({ title: 'Erreur', description: 'Échec de la sauvegarde.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleThresholdChange = async (productId: string, threshold: string) => {
    const val = parseInt(threshold, 10);
    if (isNaN(val) || val < 0) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('products')
      .update({ alert_threshold: val })
      .eq('id', productId);

    if (error) {
      console.error('Failed to update product threshold:', error);
      toast({ title: 'Erreur', description: 'Échec de la mise à jour.', variant: 'destructive' });
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, alert_threshold: val } : p))
      );
      toast({
        title: 'Seuil mis à jour',
        description: 'Le seuil d\'alerte a été mis à jour.',
      });

      // Re-check alerts
      await checkLowStockProducts('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Paramètres globaux</h3>
            <p className="text-sm text-muted-foreground">
              Configuration par défaut des alertes de stock bas
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="global-threshold" className="text-sm font-medium">
              Seuil global par défaut
            </Label>
            <Input
              id="global-threshold"
              type="number"
              min={0}
              value={globalThreshold}
              onChange={(e) => setGlobalThreshold(e.target.value)}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Quantité en dessous de laquelle une alerte est créée
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Notifications email</Label>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => setEmailNotifications(true)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  emailNotifications
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Activées
              </button>
              <button
                onClick={() => setEmailNotifications(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  !emailNotifications
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Désactivées
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Recevoir un email quand une alerte est générée (prochainement)
            </p>
          </div>
        </div>

        <Separator className="my-5" />

        <Button onClick={handleSave} disabled={saving}>
          <Settings className="mr-2 h-4 w-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      {/* Per-product thresholds */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BellIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Seuils par produit</h3>
            <p className="text-sm text-muted-foreground">
              Overrides du seuil d'alerte par produit
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun produit. Créez des produits pour configurer leurs seuils.</p>
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {product.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Seuil:
                  </span>
                  <Input
                    type="number"
                    min={0}
                    defaultValue={product.alert_threshold}
                    className="w-20 h-8 text-sm"
                    onChange={(e) =>
                      handleThresholdChange(product.id, e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
