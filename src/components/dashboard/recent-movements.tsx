import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface StockMovement {
  id: string;
  product_name: string;
  product_id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  created_at: string;
  created_by_profile: {
    full_name: string | null;
  } | null;
}

interface RecentMovementsProps {
  movements: StockMovement[];
}

export function RecentMovements({ movements }: RecentMovementsProps) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Mouvements récents</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Les 10 derniers mouvements de stock
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Produit</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-6 py-3 text-right font-medium text-muted-foreground">Qté</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Utilisateur</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  Aucun mouvement de stock enregistré
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
                >
                  <td className="px-6 py-3">
                    <Link
                      href={`/products/${m.product_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {m.product_name}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        m.type === 'IN'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium">{m.quantity}</td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {formatDate(m.created_at)}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {m.created_by_profile?.full_name || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
