import Link from 'next/link';
import { AlertTriangle, Package } from 'lucide-react';

interface LowStockProduct {
  id: string;
  name: string;
  base_quantity: number;
  alert_threshold: number;
}

interface LowStockAlertsProps {
  products: LowStockProduct[];
}

export function LowStockAlerts({ products }: LowStockAlertsProps) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-foreground">Alertes de stock bas</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Produits en dessous du seuil d&apos;alerte
        </p>
      </div>
      <div className="px-6 pb-6">
        {products.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Aucune alerte — tous les produits ont un stock suffisant</span>
          </div>
        ) : (
          <ul className="space-y-3">
            {products.slice(0, 5).map((product) => {
              const ratio = product.base_quantity / product.alert_threshold;
              const isCritical = ratio <= 0.5;

              return (
                <li
                  key={product.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    isCritical
                      ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/30'
                      : 'border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {product.name}
                    </Link>
                    {isCritical && (
                      <span className="inline-flex items-center rounded-full bg-red-200 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/50 dark:text-red-300">
                        Critique
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{product.base_quantity}</span>
                    <span className="text-muted-foreground">/ {product.alert_threshold}</span>
                  </div>
                </li>
              );
            })}
            {products.length > 5 && (
              <li className="text-center text-xs text-muted-foreground">
                ...et {products.length - 5} autre{products.length - 5 > 1 ? 's' : ''}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
