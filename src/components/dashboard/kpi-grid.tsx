import { KpiCard } from './kpi-card';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowDownUp,
} from 'lucide-react';

interface KpiData {
  totalProducts: number;
  stockValue: number;
  activeAlerts: number;
  todayMovements: number;
}

interface KpiGridProps {
  data: KpiData;
}

export function KpiGrid({ data }: KpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Produits"
        value={data.totalProducts.toLocaleString('fr-FR')}
        icon={Package}
        color="blue"
        trend={{ value: 2.5, isPositive: true }}
      />
      <KpiCard
        title="Valeur du Stock"
        value={`${data.stockValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
        icon={TrendingUp}
        color="green"
        trend={{ value: 1.2, isPositive: true }}
      />
      <KpiCard
        title="Alertes Actives"
        value={data.activeAlerts.toString()}
        icon={AlertTriangle}
        color="red"
        subtitle={data.activeAlerts > 0 ? 'Nécessitent attention' : 'Aucune alerte'}
      />
      <KpiCard
        title="Mouvements Aujourd'hui"
        value={data.todayMovements.toString()}
        icon={ArrowDownUp}
        color="purple"
        trend={{ value: -3.1, isPositive: false }}
      />
    </div>
  );
}
