export type MovementType = 'in' | 'out' | 'adjustment' | 'transfer';

export interface StockMovement {
  id: string;
  product_id: string | null;
  template_id: string | null;
  user_id: string | null;
  movement_type: MovementType;
  quantity: number;
  location_from: string | null;
  location_to: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovementFilters {
  type?: MovementType;
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
  user?: string;
}

export function formatMovementType(type: MovementType): string {
  const map: Record<MovementType, string> = {
    in: 'Entrée',
    out: 'Sortie',
    adjustment: 'Ajustement',
    transfer: 'Transfert',
  };
  return map[type];
}

export function getMovementColor(type: MovementType): string {
  const map: Record<MovementType, string> = {
    in: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    out: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    adjustment: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    transfer: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };
  return map[type];
}

export function getMovementColorVariant(type: MovementType): 'success' | 'destructive' | 'warning' | 'default' {
  const map: Record<MovementType, 'success' | 'destructive' | 'warning' | 'default'> = {
    in: 'success',
    out: 'destructive',
    adjustment: 'warning',
    transfer: 'default',
  };
  return map[type];
}
