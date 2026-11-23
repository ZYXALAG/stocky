'use client';

import { useState, useEffect } from 'react';
import { Bell, Package } from 'lucide-react';
import { AlertList } from '@/components/alerts/alert-list';
import { AlertSettings } from '@/components/alerts/alert-settings';
import type { Alert } from '@/types/alert';
import { getAlertCount, checkLowStockProducts } from '@/lib/alerts';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type Tab = 'active' | 'acknowledged' | 'settings';

export default function AlertesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [activeCount, setActiveCount] = useState(0);

  // Refresh active count on tab switch
  useEffect(() => {
    if (activeTab === 'active') {
      getAlertCount('').then(setActiveCount);
    }
  }, [activeTab]);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'active', label: 'Alertes actives', count: activeCount },
    { key: 'acknowledged', label: 'Acquittées' },
    { key: 'settings', label: 'Paramètres' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Alertes</h1>
            <p className="text-muted-foreground">
              Gérez les alertes de stock bas et configurez les seuils
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <Badge
                variant={tab.count > 0 ? 'destructive' : 'secondary'}
                className="ml-1 h-5 min-w-5 px-1.5 text-xs"
              >
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Separator />

      {activeTab === 'active' && <AlertList filter="active" />}
      {activeTab === 'acknowledged' && <AlertList filter="acknowledged" />}
      {activeTab === 'settings' && <AlertSettings />}
    </div>
  );
}
