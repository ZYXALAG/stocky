# Task 5 Report: Dashboard — Stocky

## Summary
Built a full dashboard page with real-time KPI cards, recharts-based charts, recent movements table, and low stock alerts panel. All data fetched from Supabase in server components.

## Files Created
| File | Purpose |
|------|---------|
| `src/components/dashboard/kpi-card.tsx` | KPI card with icon, title, value, optional trend indicator, blue electric theme colors |
| `src/components/dashboard/kpi-grid.tsx` | 4-card responsive grid (2-col mobile → 4-col desktop) |
| `src/components/dashboard/movements-chart.tsx` | BarChart (recharts) showing IN/OUT movements over last 7 days |
| `src/components/dashboard/category-distribution.tsx` | PieChart (recharts) showing product distribution by category |
| `src/components/dashboard/recent-movements.tsx` | Table of last 10 stock movements with IN/OUT badges, product links |
| `src/components/dashboard/low-stock-alerts.tsx` | Warning panel showing products below alert threshold (up to 5) |
| `src/app/(dashboard)/loading.tsx` | Shimmer loading skeleton matching dashboard layout |

## Files Modified
| File | Change |
|------|--------|
| `src/app/(dashboard)/page.tsx` | Replaced placeholder with full dashboard server component fetching 8 Supabase queries |
| `src/lib/utils.ts` | Added `formatDate()` and `formatDateRelative()` utilities using date-fns |

## Data Fetching (Supabase Server Queries)
1. **Total Products**: `SELECT count FROM products`
2. **Stock Value**: `SUM(base_quantity * base_cost_price)` across all products
3. **Active Alerts**: `SELECT count WHERE acknowledged = false` from alerts table
4. **Today's Movements**: `SELECT count WHERE created_at >= today` from stock_movements
5. **Movements by Day**: Last 7 days grouped by date with IN/OUT counts
6. **Category Distribution**: Products grouped by category name (via separate categories lookup)
7. **Recent Movements**: Last 10 stock movements with product names and creator profiles
8. **Low Stock Products**: Products where `base_quantity <= alert_threshold`

## Verification
- ✅ TypeScript compiles clean (`tsc --noEmit` — zero errors)
- ✅ Next.js production build succeeds (`npm run build` — compiled successfully)
- ✅ All 8 Supabase queries structured for RLS-compatible access
- ✅ Responsive grid: 2-col on mobile, 4-col on desktop
- ✅ Charts use `ResponsiveContainer` from recharts
- ✅ Loading skeleton mirrors actual dashboard structure
- ✅ Committed as `de4caed`

## Notes
- Products table uses `base_quantity` and `base_cost_price` (not `current_quantity`/`cost_price`)
- Category and profile data fetched via separate queries due to Supabase FK naming
- The `products!inner` join syntax used for stock_movements → products to ensure product names are included
- Category join done via separate `categories` table lookup with `IN` clause for reliability
