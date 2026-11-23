import { createClient } from '@/lib/supabase/server';
import { KpiGrid } from '@/components/dashboard/kpi-grid';
import { MovementsChart } from '@/components/dashboard/movements-chart';
import { CategoryDistribution } from '@/components/dashboard/category-distribution';
import { RecentMovements } from '@/components/dashboard/recent-movements';
import { LowStockAlerts } from '@/components/dashboard/low-stock-alerts';
import { formatDate } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
interface MovementChartRow {
  date: string;
  in_count: number;
  out_count: number;
}

interface CategoryRow {
  name: string;
  count: number;
}

interface RecentMovementRow {
  id: string;
  product_name: string;
  product_id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  created_at: string;
  created_by_profile: { full_name: string | null } | null;
}

interface LowStockRow {
  id: string;
  name: string;
  base_quantity: number;
  alert_threshold: number;
}

interface DashboardData {
  totalProducts: number;
  stockValue: number;
  activeAlerts: number;
  todayMovements: number;
  movementsByDay: MovementChartRow[];
  categories: CategoryRow[];
  recentMovements: RecentMovementRow[];
  lowStockProducts: LowStockRow[];
}

// ── Server data fetch ──────────────────────────────────────────────────────
async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  // 1. Total products count
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  // 2. Total stock value = SUM(base_quantity * base_cost_price)
  const stockValueResult = await supabase
    .from('products')
    .select('base_quantity, base_cost_price');

  const stockValue = (stockValueResult.data || []).reduce(
    (sum, p) => sum + (Number(p.base_quantity) || 0) * (Number(p.base_cost_price) || 0),
    0
  );

  // 3. Active alerts = count where acknowledged = false
  const { count: activeAlerts } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('acknowledged', false);

  // 4. Today's movements count
  const { count: todayMovements } = await supabase
    .from('stock_movements')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStr);

  // 5. Movements for chart (last 7 days, grouped by date)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: movementsByDay } = await supabase
    .from('stock_movements')
    .select('created_at, type')
    .gte('created_at', sevenDaysAgo.toISOString())
    .lt('created_at', todayStr)
    .order('created_at', { ascending: true });

  // Group and count
  const dayMap = new Map<string, { in_count: number; out_count: number }>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1 - i);
    const key = d.toISOString().split('T')[0];
    dayMap.set(key, { in_count: 0, out_count: 0 });
  }
  movementsByDay?.forEach((m) => {
    const key = m.created_at.split('T')[0];
    const entry = dayMap.get(key);
    if (entry) {
      if (m.type === 'IN') entry.in_count++;
      else entry.out_count++;
    }
  });
  const movementsChartData: MovementChartRow[] = Array.from(dayMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 6. Category distribution
  const { data: categories } = await supabase
    .from('products')
    .select(`
      category_id
    `);

  // Fetch category names separately
  const categoryIds = new Set(
    (categories || []).map((p: any) => p.category_id).filter(Boolean)
  );
  const { data: catRows } = categoryIds.size > 0
    ? await supabase
        .from('categories')
        .select('id, name')
        .in('id', Array.from(categoryIds))
    : { data: [] };
  const catNameMap = new Map<string, string>();
  (catRows || []).forEach((c: any) => {
    catNameMap.set(c.id, c.name);
  });

  const catMap = new Map<string, number>();
  (categories || []).forEach((p: any) => {
    const catName = p.category_id ? (catNameMap.get(p.category_id) || 'Sans catégorie') : 'Sans catégorie';
    catMap.set(catName, (catMap.get(catName) || 0) + 1);
  });
  const categoriesData: CategoryRow[] = Array.from(catMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // 7. Recent movements (last 10)
  const { data: recentMovements } = await supabase
    .from('stock_movements')
    .select(`
      id,
      type,
      quantity,
      created_at,
      product_id,
      created_by,
      products!inner ( name )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch profile names for movement creators
  const creatorIds = new Set(
    (recentMovements || []).map((m: any) => m.created_by).filter(Boolean)
  );
  const { data: profiles } = creatorIds.size > 0
    ? await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(creatorIds))
    : { data: [] };
  const profileMap = new Map<string, string | null>();
  (profiles || []).forEach((p: any) => {
    profileMap.set(p.id, p.full_name);
  });

  const recentMovementsData: RecentMovementRow[] = (recentMovements || []).map((m: any) => ({
    id: m.id,
    product_name: m.products?.name || '—',
    product_id: m.product_id,
    type: m.type,
    quantity: m.quantity,
    created_at: m.created_at,
    created_by_profile: m.created_by
      ? { full_name: profileMap.get(m.created_by) || null }
      : null,
  }));

  // 8. Low stock products (base_quantity <= alert_threshold)
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('id, name, base_quantity, alert_threshold')
    .lte('base_quantity', 'alert_threshold')
    .order('base_quantity', { ascending: true })
    .limit(5);

  return {
    totalProducts: totalProducts || 0,
    stockValue,
    activeAlerts: activeAlerts || 0,
    todayMovements: todayMovements || 0,
    movementsByDay: movementsChartData,
    categories: categoriesData,
    recentMovements: recentMovementsData,
    lowStockProducts: (lowStockProducts || []) as unknown as LowStockRow[],
  };
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const data = await fetchDashboardData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="mt-1 text-muted-foreground">
          Vue d&apos;ensemble de votre inventaire
        </p>
      </div>

      {/* KPI Cards */}
      <KpiGrid data={data} />

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <MovementsChart data={data.movementsByDay} />
        <CategoryDistribution data={data.categories} />
      </div>

      {/* Recent Movements + Low Stock */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentMovements movements={data.recentMovements} />
        </div>
        <LowStockAlerts products={data.lowStockProducts} />
      </div>
    </div>
  );
}
