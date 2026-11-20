# Task 5: Dashboard — Stocky

## Context
Stocky is a universal inventory management app. Task 4 completed the layout and navigation. Now we build the dashboard with KPIs, charts, and recent activity.

WORKING DIRECTORY: C:/Users/adrig/stocky/
GIT BASE: be3062e (previous commits)

## Requirements (verbatim from plan)

### Step 1: Dashboard KPI cards

- src/components/dashboard/kpi-card.tsx — KpiCard component:
  - Props: title, value, icon, trend?, color?, subtitle?
  - Styled card with icon, title, large value
  - Optional trend indicator (up/down arrow + percentage)
  - Uses blue electric theme colors

- src/components/dashboard/kpi-grid.tsx — KpiGrid component:
  - Grid of KPI cards
  - 4 cards on desktop (2-col grid), 1-col on mobile
  - Cards:
    1. "Total Produits" — count from products table
    2. "Valeur du Stock" — sum(quantity * cost_price) from products
    3. "Alertes Actives" — count of acknowledged=false alerts
    4. "Mouvements Aujourd'hui" — count of stock_movements where date = today

### Step 2: Charts

- src/components/dashboard/movements-chart.tsx — MovementsChart component:
  - Uses recharts (BarChart or LineChart)
  - Shows movements count over last 7 days
  - Two series: IN (green) and OUT (red)
  - Responsive width/height
  - Title: "Mouvements récents"

- src/components/dashboard/category-distribution.tsx — CategoryDistribution component:
  - Uses recharts (PieChart)
  - Shows product distribution by category
  - Color palette for each category
  - Title: "Distribution par catégorie"

### Step 3: Recent movements table

- src/components/dashboard/recent-movements.tsx — RecentMovements component:
  - Table with last 10 stock movements
  - Columns: Product name, type (IN/OUT), quantity, date, user
  - IN type = green badge, OUT type = red badge
  - Clickable links to product detail page

### Step 4: Low stock alerts panel

- src/components/dashboard/low-stock-alerts.tsx — LowStockAlerts component:
  - List of products where current_quantity <= alert_threshold
  - Each item: product name, current quantity, threshold, product link
  - Styled with warning accent
  - Shows up to 5 items

### Step 5: Dashboard page

- src/app/(dashboard)/page.tsx — Dashboard page:
  - Fetches real data from Supabase:
    - Total products count
    - Total stock value (sum of quantity * cost_price)
    - Active alerts count
    - Today's movements count
    - Movements for chart (last 7 days grouped by date)
    - Category distribution (grouped by category)
    - Recent movements (last 10, ordered by date desc)
    - Low stock products
  - Renders all components in a responsive grid
  - Layout: KPIs top row, charts + tables below

### Step 6: Dashboard layout

- src/app/(dashboard)/layout.tsx — Update with:
  - Session check (redirect to /login if not authenticated)
  - Fetch profile for greeting ("Bonjour, [name]")
  - Include the dashboard content

### Step 7: Loading states

- src/app/(dashboard)/loading.tsx — Loading skeleton:
  - Shimmer loading placeholders for all cards and charts
  - Uses Tailwind animate-pulse

### Step 8: Verify
- Dashboard shows real data from Supabase
- KPI cards update dynamically
- Charts render with real data
- Recent movements table populated
- Low stock alerts shown
- Loading skeleton visible during data fetch
- Responsive: KPIs stack on mobile

### Step 9: Commit
```bash
git add .
git commit -m "feat: add dashboard with KPIs, charts, recent movements, and low stock alerts"
```

## Interfaces
- Consumes: Auth (profile), Supabase client, database schema
- Produces: Full dashboard with KPIs, charts (recharts), recent movements table, low stock alerts, loading skeleton

## Constraints
- Use recharts for all charts (BarChart, PieChart)
- Fetch data in server components for initial load
- Use Supabase direct queries (no API routes needed for dashboard)
- All data must come from Supabase, never hardcoded
- Loading skeleton must match the layout of the actual dashboard
- KPI cards must have consistent sizing and styling
- Charts must be responsive (use recharts ResponsiveContainer)
- Color palette: blue electric for primary, green for IN, red for OUT
- Use forward-slash paths

## Report File
Write report to: `C:/Users/adrig/stocky/.superpowers/sdd/stocky-plan/task-5-report.md`
