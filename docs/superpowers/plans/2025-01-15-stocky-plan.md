# Stocky Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Stocky — a universal inventory management app for web, mobile, and desktop, using Next.js, Supabase, and Capacitor.

**Architecture:** Single Next.js app deployed on Vercel (web) + Capacitor wrappers for iOS, Android, Windows, macOS, Linux. Supabase provides PostgreSQL, Auth, Storage, and Realtime.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui, Supabase (PostgreSQL, Auth, Storage), Capacitor, lucide-react, recharts, zod, qrcode, papaparse

**Spec:** docs/superpowers/specs/2025-01-15-stocky-design.md

## Global Constraints

- **Free tier only:** Vercel free + Supabase free (500MB DB, 1GB storage, 50k MAU)
- **Bleu électrique color:** primary #0D6EFD, light #3399FF, dark #0052CC
- **3 platforms:** web (Vercel), mobile (Capacitor), desktop (Capacitor)
- **Modern & clean design:** minimal, no clutter, consistent spacing
- **All 11 features from spec:** dashboard, products, templates, movements, alerts, search/filters, CSV export, QR/barcode, suppliers, categories, auth
- **Products have photo (optional) + configurable custom fields**
- **5 default templates:** electronics, clothing, food, hardware, personal

## Review Focus

1. **RLS security:** Ensure every table has row-level security preventing cross-user access — test with unauthenticated and authenticated queries
2. **Photo upload safety:** Validate file type/size before upload to Supabase Storage; prevent path traversal
3. **Template field validation:** Custom fields (JSONB) must be validated against field schema before DB write
4. **Negative stock prevention:** Stock movements that would result in negative quantity must be rejected
5. **Responsive breakpoints:** Verify UI works at 320px, 768px, 1024px, 1440px — test with browser devtools

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `tsconfig.json`
- Create: `.env.local` (template)
- Create: `.gitignore`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Create: `src/lib/constants.ts`
- Create: `public/manifest.json`
- Create: `capacitor.config.ts`

**Interfaces:**
- Consumes: none
- Produces: A working Next.js project with Tailwind, TypeScript, Shadcn/ui configured, global color system with #0D6EFD primary, responsive base layout

- [ ] **Step 1: Scaffold the project with package.json and all config files**
  - next.config.js with proper Next.js 14 settings
  - tailwind.config.ts with the blue electric color palette (#0D6EFD as primary)
  - tsconfig.json with strict mode, path aliases (@/* → src/*)
  - postcss.config.mjs
  - .env.local.template with Supabase URL and anon key placeholders
  - .gitignore (include node_modules, .next, .env, native/, capacitor.config.local.ts)
  - capacitor.config.ts
  - public/manifest.json for PWA

- [ ] **Step 2: Create base src/ structure**
  - src/app/layout.tsx — root layout with metadata, PWA links, global CSS, Inter font
  - src/app/page.tsx — redirects to /dashboard (placeholder for now)
  - src/app/globals.css — CSS variables for the blue electric theme, base Tailwind imports
  - src/lib/utils.ts — cn() utility from Shadcn/ui pattern
  - src/lib/constants.ts — color palette, supabase URLs placeholder

- [ ] **Step 3: Install dependencies**
  - core: next@^14.0.0, react@^18, react-dom@^18
  - tailwind: tailwindcss@^3.4, @tailwindcss/forms, @tailwindcss/typography
  - ui: class-variance-authority, clsx, tailwind-merge, lucide-react
  - data: @supabase/supabase-js, zod
  - csv: papaparse
  - qrcode: qrcode.react
  - charts: recharts
  - capacitor: @capacitor/core, @capacitor/cli
  - other: date-fns, uuid, @capacitor/camera

- [ ] **Step 4: Verify build**
  - Run `npx next build` and verify successful compilation
  - Ensure no TypeScript errors
  - Verify the blue electric color appears in the generated CSS

- [ ] **Step 5: Commit**
  ```bash
  git add .
  git commit -m "chore: scaffold Stocky project with Next.js, Tailwind, and Capacitor"
  ```

---

### Task 2: Supabase Schema & Client

**Files:**
- Create: `supabase/migrations/001_create_profiles.sql`
- Create: `supabase/migrations/002_create_templates_fields.sql`
- Create: `supabase/migrations/003_create_categories.sql`
- Create: `supabase/migrations/004_create_suppliers.sql`
- Create: `supabase/migrations/005_create_products.sql`
- Create: `supabase/migrations/006_create_stock_movements.sql`
- Create: `supabase/migrations/007_create_alerts.sql`
- Create: `supabase/migrations/008_create_settings.sql`
- Create: `supabase/migrations/009_seed_templates.sql`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts`

**Interfaces:**
- Consumes: none (Task 1 provides the project structure)
- Produces: Complete Supabase schema with all 9 tables, RLS policies, Supabase client (client + server), middleware for auth session, seed data for 5 default templates

- [ ] **Step 1: Write migrations**
  - 001_create_profiles.sql: profiles table linked to auth.users (id, full_name, avatar_url, role, created_at, updated_at)
  - 002_create_templates_fields.sql: templates (id, name, description, icon, created_at, updated_at) + fields (id, template_id FK, name, type [text|number|date|select|checkbox|textarea|currency], label, required, options JSONB, order, created_at)
  - 003_create_categories.sql: categories (id, name, slug, description, parent_id FK self, created_at)
  - 004_create_suppliers.sql: suppliers (id, name, email, phone, address, website, contact_person, created_at)
  - 005_create_products.sql: products (id, name, description, photo_url, category_id FK, supplier_id FK, template_id FK, base_quantity, base_cost_price, base_selling_price, custom_fields JSONB, alert_threshold, created_by FK profiles(id), created_at, updated_at)
  - 006_create_stock_movements.sql: stock_movements (id, product_id FK, type [IN|OUT], quantity, reference, justification TEXT, created_by FK profiles(id), created_at)
  - 007_create_alerts.sql: alerts (id, product_id FK nullable for global, threshold, acknowledged BOOL, created_at, acknowledged_at)
  - 008_create_settings.sql: settings (key TEXT PRIMARY KEY, value JSONB, updated_at)
  - 009_seed_templates.sql: INSERT 5 default templates + their fields (electronics, clothing, food, hardware, personal)
  - ALL tables: enable RLS, add policies for authenticated users to CRUD their own data
  - ALL tables: add indexes on FK columns and common query columns

- [ ] **Step 2: Create Supabase client modules**
  - src/lib/supabase/client.ts: createBrowserClient() using @supabase/ssr pattern
  - src/lib/supabase/server.ts: createServerClient() for server components
  - src/lib/supabase/middleware.ts: createMiddleWareClient() for Next.js middleware
  - middleware.ts: protect all routes under / except /auth/login, /auth/register, /auth/reset, /auth/verify

- [ ] **Step 3: Verify migrations**
  - Ensure all SQL is valid (check FK constraints, RLS policies)
  - Verify seed data has proper template fields for each of the 5 templates
  - Check RLS policies: authenticated users can only access their own data

- [ ] **Step 4: Commit**
  ```bash
  git add .
  git commit -m "feat: add Supabase schema, migrations, seed data, and client modules"
  ```

---

### Task 3: Authentication

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/forgot-password/page.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/actions.ts`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/register-form.tsx`
- Create: `src/components/auth/forgot-password-form.tsx`
- Create: `src/hooks/use-auth.ts`
- Create: `src/app/dashboard/page.tsx` (placeholder redirect after auth)

**Interfaces:**
- Consumes: Supabase client from Task 2
- Produces: Login, register, and forgot-password pages with proper auth flows, useAuth hook for session state, middleware-protected routes

- [ ] **Step 1: Auth forms and actions**
  - src/app/(auth)/login/page.tsx: login page with email/password form
  - src/app/(auth)/register/page.tsx: register page with email/password/name
  - src/app/(auth)/forgot-password/page.tsx: password reset page
  - src/app/(auth)/actions.ts: server actions for signUp, signIn, signOut, resetPassword
  - All forms with zod validation
  - Proper error/success messages using toast

- [ ] **Step 2: Auth layout and components**
  - src/app/(auth)/layout.tsx: centered layout with Stocky branding
  - src/components/auth/login-form.tsx: email + password inputs, submit button, link to register
  - src/components/auth/register-form.tsx: name + email + password inputs, link to login
  - src/components/auth/forgot-password-form.tsx: email input only
  - Use consistent form styling with blue electric primary button

- [ ] **Step 3: Auth hook and dashboard redirect**
  - src/hooks/use-auth.ts: useAuth hook that provides session, user, loading state, signIn, signUp, signOut
  - src/app/dashboard/page.tsx: placeholder dashboard page that redirects if not authenticated
  - Verify middleware correctly protects routes

- [ ] **Step 4: Verify auth flows**
  - Test registration → email confirmation → login
  - Test login → dashboard redirect
  - Test password reset flow
  - Test logout
  - Verify middleware blocks unauthenticated access to /dashboard

- [ ] **Step 5: Commit**
  ```bash
  git add .
  git commit -m "feat: add authentication with login, register, forgot-password"
  ```

---

### Task 4: Layout & Navigation

**Files:**
- Create: `src/components/layout/main-layout.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/mobile-nav.tsx`
- Create: `src/components/layout/header.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/avatar.tsx`
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/page.tsx` (dashboard page)

**Interfaces:**
- Consumes: Auth system from Task 3, Supabase client from Task 2
- Produces: Responsive layout with collapsible sidebar (desktop), bottom nav (mobile), header with search and notifications, Shadcn/ui components, consistent blue electric theme across all pages

- [ ] **Step 1: Core UI components (Shadcn/ui style)**
  - button.tsx: variants (default, secondary, outline, ghost, destructive), blue electric as default
  - input.tsx: styled input with label support
  - card.tsx: card component with header, content, footer
  - dialog.tsx: modal dialog
  - badge.tsx: status badges (success, warning, error, info)
  - avatar.tsx: user avatar
  - tabs.tsx: tab interface
  - dropdown-menu.tsx: context menu
  - select.tsx: dropdown select

- [ ] **Step 2: Layout components**
  - sidebar.tsx: collapsible sidebar with nav items (Dashboard, Products, Categories, Suppliers, Movements, Alerts, Templates, Settings), icons from lucide-react, blue accent on active
  - mobile-nav.tsx: bottom navigation bar for mobile (Dashboard, Products, Movements, Alerts, Menu)
  - header.tsx: top bar with breadcrumb, global search, notification bell, user avatar dropdown
  - main-layout.tsx: combines sidebar + header + main content area, handles responsive switching

- [ ] **Step 3: Dashboard layout and page**
  - src/app/(dashboard)/layout.tsx: wraps dashboard routes with MainLayout
  - src/app/(dashboard)/page.tsx: dashboard placeholder (real content in Task 5)
  - Ensure responsive behavior: sidebar collapses on mobile, bottom nav appears

- [ ] **Step 4: Verify layout**
  - Test at 320px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop)
  - Verify sidebar toggle works
  - Verify all Shadcn components render correctly
  - Ensure consistent blue electric color application

- [ ] **Step 5: Commit**
  ```bash
  git add .
  git commit -m "feat: add responsive layout, navigation, and Shadcn/ui components"
  ```

---

### Task 5: Dashboard

**Files:**
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/components/dashboard/kpi-cards.tsx`
- Create: `src/components/dashboard/movements-chart.tsx`
- Create: `src/components/dashboard/recent-movements.tsx`
- Create: `src/components/dashboard/alerts-widget.tsx`
- Create: `src/app/(dashboard)/dashboard/actions.ts`

**Interfaces:**
- Consumes: Layout from Task 4, Supabase client from Task 2
- Produces: Dashboard with 4 KPI cards (total products, stock value, low stock alerts, recent movements), movements chart (last 7 days), recent movements table, active alerts widget — all with real Supabase data

- [ ] **Step 1: Dashboard API actions**
  - src/app/(dashboard)/dashboard/actions.ts: server actions to fetch dashboard stats
  - getDashboardStats(): returns {totalProducts, totalStockValue, lowStockCount, recentMovementsCount}
  - getMovementsLast7Days(): returns daily movement data for chart
  - getRecentMovements(): returns last 20 movements with product names
  - getActiveAlerts(): returns products below threshold

- [ ] **Step 2: KPI cards**
  - kpi-cards.tsx: 4 cards in responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
  - Cards: Total Products, Stock Value, Low Stock Alerts, Recent Movements
  - Each card: icon (lucide), value, label, trend indicator
  - Blue electric theme for primary KPI

- [ ] **Step 3: Movements chart**
  - movements-chart.tsx: recharts BarChart showing movements (IN vs OUT) over last 7 days
  - Responsive, with tooltips and legend
  - Blue electric for IN, warm color for OUT

- [ ] **Step 4: Recent movements & alerts widgets**
  - recent-movements.tsx: table with last 10 movements (product, type, quantity, date)
  - alerts-widget.tsx: list of products below threshold with quantity remaining
  - Both fetch real data from Supabase

- [ ] **Step 5: Assemble dashboard page**
  - dashboard/page.tsx: combine all widgets, responsive grid layout
  - Loading states while data fetches
  - Error handling with retry
  - Verify all data comes from Supabase with correct RLS

- [ ] **Step 6: Commit**
  ```bash
  git add .
  git commit -m "feat: add dashboard with KPIs, movements chart, recent movements, and alerts"
  ```

---

### Task 6: Templates & Custom Fields

**Files:**
- Create: `src/app/(templates)/templates/page.tsx`
- Create: `src/app/(templates)/templates/[id]/page.tsx`
- Create: `src/app/(templates)/templates/new/page.tsx`
- Create: `src/components/templates/template-list.tsx`
- Create: `src/components/templates/template-form.tsx`
- Create: `src/components/templates/field-editor.tsx`
- Create: `src/lib/templates.ts`
- Create: `src/types/template.ts`

**Interfaces:**
- Consumes: Supabase client from Task 2, Layout from Task 4
- Produces: Template CRUD (create, read, update, delete), field editor with 7 field types (text, number, date, select, checkbox, textarea, currency), 5 default templates loaded, ability to create custom templates

- [ ] **Step 1: Types and utilities**
  - src/types/template.ts: TemplateField, Template types with Zod schemas
  - Field types: text, number, date, select, checkbox, textarea, currency
  - src/lib/templates.ts: template utility functions (getTemplateFields, validateCustomFields)

- [ ] **Step 2: Template list and form**
  - template-list.tsx: grid of templates with name, icon, field count, action buttons
  - template-form.tsx: form to create/edit template (name, description, icon picker)
  - Field editor: dynamic add/remove fields with type-specific inputs
  - Select type shows options input (comma-separated)
  - All forms validated with zod

- [ ] **Step 3: Template detail page**
  - [id]/page.tsx: view template fields, edit, duplicate, delete
  - Show field preview with sample values

- [ ] **Step 4: Seed default templates**
  - If templates table is empty, insert 5 defaults:
    - Electronics: serial_number (text), brand (text), warranty_months (number), purchase_date (date)
    - Clothing: size (select: XS|S|M|L|XL), color (text), material (text), season (select: Spring|Summer|Autumn|Winter)
    - Food: expiry_date (date), quantity_unit (select: kg|g|L|ml|units), storage_temp (text), batch_number (text)
    - Hardware: sku (text), weight_kg (number), dimensions (text), min_stock (number)
    - Personal: notes (textarea), purchase_date (date), value (currency), location (text)
  - Ensure 009_seed_templates.sql properly seeds these

- [ ] **Step 5: Verify template CRUD**
  - Create a custom template with various field types
  - Edit an existing template
  - Delete a template (cascade to fields)
  - Verify all 5 default templates are present
  - Verify field validation works (required fields, type checking)

- [ ] **Step 6: Commit**
  ```bash
  git add .
  git commit -m "feat: add template system with custom fields and 5 default templates"
  ```

---

### Task 7: Products Management

**Files:**
- Create: `src/app/(products)/products/page.tsx`
- Create: `src/app/(products)/products/new/page.tsx`
- Create: `src/app/(products)/products/[id]/page.tsx`
- Create: `src/app/(products)/products/[id]/edit/page.tsx`
- Create: `src/components/products/product-list.tsx`
- Create: `src/components/products/product-form.tsx`
- Create: `src/components/products/product-detail.tsx`
- Create: `src/components/products/photo-upload.tsx`
- Create: `src/lib/products.ts`
- Create: `src/types/product.ts`

**Interfaces:**
- Consumes: Templates from Task 6, Supabase client + Storage from Task 2, Layout from Task 4
- Produces: Full product CRUD with photo upload, dynamic fields based on template, search/filter, pagination, sort

- [ ] **Step 1: Types and utilities**
  - src/types/product.ts: Product type with Zod validation
  - src/lib/products.ts: getProducts (with filters, pagination, sort), getProduct, createProduct, updateProduct, deleteProduct, searchProducts

- [ ] **Step 2: Product list**
  - product-list.tsx: table/grid view with search bar, filter by category/supplier/template, sort controls
  - Pagination (10/25/50 per page)
  - Columns: photo thumbnail, name, category, quantity, cost price, selling price, actions
  - Responsive: table on desktop, cards on mobile

- [ ] **Step 3: Product form**
  - product-form.tsx: dynamic form based on selected template
  - Common fields: name, description, quantity, cost price, selling price, category, supplier, alert threshold
  - Template fields: rendered dynamically based on template fields
  - Photo upload: drag & drop + file picker, preview, upload to Supabase Storage
  - Validation on all fields

- [ ] **Step 4: Product detail and edit**
  - product-detail.tsx: full product view with photo, all fields, movements history tab
  - [id]/edit/page.tsx: same form as new, pre-filled with existing data
  - Product actions: edit, delete, add stock, remove stock

- [ ] **Step 5: Photo upload**
  - photo-upload.tsx: upload component with preview, remove, Supabase Storage integration
  - Validate file type (image/*) and size (max 5MB)
  - Store photos in supabase/storage/products/{product_id}

- [ ] **Step 6: Verify product CRUD**
  - Create product with all field types
  - Upload photo
  - Edit product
  - Delete product
  - Search and filter products
  - Verify pagination and sorting
  - Verify photo stored in Supabase Storage and displayed correctly

- [ ] **Step 7: Commit**
  ```bash
  git add .
  git commit -m "feat: add product management with photo upload, dynamic template fields, search and pagination"
  ```

---

### Task 8: Categories & Suppliers

**Files:**
- Create: `src/app/(categories)/categories/page.tsx`
- Create: `src/app/(categories)/categories/new/page.tsx`
- Create: `src/app/(categories)/categories/[id]/edit/page.tsx`
- Create: `src/components/categories/category-tree.tsx`
- Create: `src/components/categories/category-form.tsx`
- Create: `src/app/(suppliers)/suppliers/page.tsx`
- Create: `src/app/(suppliers)/suppliers/new/page.tsx`
- Create: `src/app/(suppliers)/suppliers/[id]/edit/page.tsx`
- Create: `src/components/suppliers/supplier-list.tsx`
- Create: `src/components/suppliers/supplier-form.tsx`

**Interfaces:**
- Consumes: Supabase client from Task 2, Layout from Task 4
- Produces: Category tree with parent/child hierarchy (CRUD), Supplier CRUD with contact info

- [ ] **Step 1: Categories**
  - category-tree.tsx: collapsible tree view with indentation for hierarchy
  - category-form.tsx: form for name, slug (auto-generated), description, parent category select
  - categories/page.tsx: list with tree view and add/edit/delete actions
  - parent_id FK allows unlimited hierarchy depth

- [ ] **Step 2: Suppliers**
  - supplier-list.tsx: table with name, email, phone, contact person, actions
  - supplier-form.tsx: form for name, email, phone, address, website, contact_person
  - suppliers/page.tsx: list with search and add button
  - Link suppliers to products

- [ ] **Step 3: Integrate with products**
  - Category select in product form populated from categories table
  - Supplier select in product form populated from suppliers table
  - Category tree shows product count per category

- [ ] **Step 4: Verify**
  - Create parent and child categories
  - Create suppliers
  - Assign category and supplier to products
  - Verify hierarchy displays correctly
  - Verify search works for both

- [ ] **Step 5: Commit**
  ```bash
  git add .
  git commit -m "feat: add categories with hierarchy and suppliers management"
  ```

---

### Task 9: Stock Movements

**Files:**
- Create: `src/app/(movements)/movements/page.tsx`
- Create: `src/app/(movements)/movements/new/page.tsx`
- Create: `src/app/(movements)/movements/[id]/page.tsx`
- Create: `src/components/movements/movement-form.tsx`
- Create: `src/components/movements/movement-history.tsx`
- Create: `src/lib/movements.ts`

**Interfaces:**
- Consumes: Products from Task 7, Supabase client from Task 2
- Produces: Stock IN/OUT movements with validation (no negative stock), history view, product-level movement history

- [ ] **Step 1: Movement logic**
  - src/lib/movements.ts: createMovement (IN/OUT), getMovements (with filters), getProductMovements
  - Validate: OUT movements cannot result in negative stock
  - Update product quantity atomically with movement creation
  - Reference field for linking to orders/returns

- [ ] **Step 2: Movement form**
  - movement-form.tsx: select product, type (IN/OUT), quantity, reference, justification (required for OUT)
  - Show current stock level before submission
  - Validation: quantity > 0, OUT won't go negative

- [ ] **Step 3: Movement history**
  - movement-history.tsx: table with product name, type, quantity, reference, date, user
  - Filters: date range, type (IN/OUT), product, supplier
  - Sortable columns

- [ ] **Step 4: Product movement detail**
  - movements/[id]/page.tsx: full movement details
  - Product page shows movement history tab

- [ ] **Step 5: Verify**
  - Create IN movement → verify stock increases
  - Create OUT movement → verify stock decreases
  - Try creating OUT that would go negative → verify rejection
  - Verify movement history displays correctly
  - Verify all filters work

- [ ] **Step 6: Commit**
  ```bash
  git add .
  git commit -m "feat: add stock movements with IN/OUT tracking, validation, and history"
  ```

---

### Task 10: Low Stock Alerts

**Files:**
- Create: `src/app/(alerts)/alerts/page.tsx`
- Create: `src/components/alerts/alert-list.tsx`
- Create: `src/components/alerts/alert-settings.tsx`
- Create: `src/lib/alerts.ts`
- Create: `src/app/api/alerts/check/route.ts` (edge function for periodic check)

**Interfaces:**
- Consumes: Products from Task 7, Movements from Task 9, Supabase from Task 2
- Produces: Low stock alerts per product and global, acknowledgment system, periodic check via cron/edge function, notification display

- [ ] **Step 1: Alert logic**
  - src/lib/alerts.ts: checkLowStock() — scans all products for qty <= threshold, getActiveAlerts(), acknowledgeAlert()
  - Alert auto-created/updated when product quantity changes
  - Threshold per product (alert_threshold field) + global default in settings

- [ ] **Step 2: Alert list page**
  - alert-list.tsx: table of active alerts with product name, current qty, threshold, days since last movement
  - Color coding: red (<25% of threshold), yellow (25-50%), orange (50-100%)
  - Acknowledge button to dismiss alerts

- [ ] **Step 3: Alert settings**
  - alert-settings.tsx: set global default threshold
  - Per-product threshold override from product detail page
  - Toggle for email notifications

- [ ] **Step 4: Notification display**
  - Header notification bell shows count of active alerts
  - Clicking bell opens alert dropdown
  - Badge on dashboard showing alert count

- [ ] **Step 5: Verify**
  - Create product with threshold = 10, set quantity to 5 → verify alert appears
  - Increase quantity above threshold → verify alert clears
  - Acknowledge alert → verify it's dismissed
  - Verify global vs per-product thresholds

- [ ] **Step 6: Commit**
  ```bash
  git add .
  git commit -m "feat: add low stock alerts with thresholds, acknowledgment, and notifications"
  ```

---

### Task 11: Search, Filters & CSV Export

**Files:**
- Create: `src/components/common/global-search.tsx`
- Create: `src/components/common/filter-bar.tsx`
- Create: `src/lib/search.ts`
- Create: `src/lib/export.ts`
- Create: `src/app/api/export/csv/route.ts`

**Interfaces:**
- Consumes: Products from Task 7, Categories from Task 8, Suppliers from Task 8
- Produces: Global search across all entities, advanced filter bar (multi-criteria), CSV export (all or filtered data)

- [ ] **Step 1: Global search**
  - src/lib/search.ts: searchProducts, searchCategories, searchSuppliers
  - GlobalSearch component in header
  - Uses Supabase text search or client-side fuse.js for fast filtering
  - Results: type icon, name, preview text

- [ ] **Step 2: Advanced filter bar**
  - filter-bar.tsx: reusable filter component
  - Product filters: category, supplier, template, quantity range, price range, date range
  - Movement filters: type, date range, product, user
  - Applied filters shown as removable chips

- [ ] **Step 3: CSV export**
  - src/lib/export.ts: exportProductsToCSV, exportMovementsToCSV, exportSuppliersToCSV
  - API route: src/app/api/export/csv/route.ts — accepts query params for filters
  - Downloads .csv file with proper headers
  - Product export includes custom fields as separate columns
  - Uses papaparse for CSV generation

- [ ] **Step 4: Integrate into list pages**
  - Product list: search + filter bar + export button
  - Movement list: search + filter bar + export button
  - Supplier list: search + export button

- [ ] **Step 5: Verify**
  - Search for products by name → verify results
  - Apply multiple filters → verify correct subset
  - Export products to CSV → verify file content and download
  - Export filtered data → verify only filtered items included

- [ ] **Step 6: Commit**
  ```bash
  git add .
  git commit -m "feat: add global search, advanced filters, and CSV export"
  ```

---

### Task 12: Barcode & QR Code

**Files:**
- Create: `src/components/barcode/barcode-scanner.tsx`
- Create: `src/components/barcode/qr-generator.tsx`
- Create: `src/components/barcode/label-print.tsx`
- Create: `src/app/(products)/products/[id]/barcode/page.tsx`
- Create: `src/app/api/barcode/generate/route.ts`

**Interfaces:**
- Consumes: Products from Task 7, Layout from Task 4
- Produces: Barcode scanning (camera), QR code generation per product, printable label templates

- [ ] **Step 1: QR code generation**
  - qr-generator.tsx: generate QR code for product (URL or product ID)
  - qr-generator.tsx: uses qrcode.react for rendering
  - Product barcode page: show QR code, generate label

- [ ] **Step 2: Barcode scanner**
  - barcode-scanner.tsx: camera-based barcode/QR scanner
  - Desktop: use BarcodeDetector API (Chrome/Edge)
  - Mobile: use Capacitor Camera + barcode detection
  - On scan: lookup product by barcode, show detail or add stock
  - Fallback: manual barcode input

- [ ] **Step 3: Label printing**
  - label-print.tsx: generate printable label with product name, QR code, price
  - CSS @media print styles for label sheets
  - Standard label sizes: 57x25mm, 100x40mm

- [ ] **Step 4: Verify**
  - Generate QR for a product → verify it encodes correctly
  - Scan QR → verify it opens the right product
  - Print label → verify formatting

- [ ] **Step 5: Commit**
  ```bash
  git add .
  git commit -m "feat: add barcode scanning, QR code generation, and label printing"
  ```

---

### Task 13: Capacitor (Mobile & Desktop)

**Files:**
- Create: `capacitor.config.ts`
- Create: `native/` (placeholder for generated projects)
- Modify: `next.config.js` (add capacitor-compatible settings)
- Create: `src/app/manifest.ts` (dynamic manifest)

**Interfaces:**
- Consumes: Complete web app from Tasks 1-12
- Produces: Capacitor configuration, PWA manifest, build scripts for Android, iOS, Windows, desktop builds

- [ ] **Step 1: Capacitor configuration**
  - capacitor.config.ts: app ID, name, webDir (out directory), plugins
  - next.config.js: output: 'export' (static HTML) for Capacitor compatibility
  - SSG routes for all pages that don't need SSR

- [ ] **Step 2: PWA setup**
  - manifest.json: proper app icons, display: standalone, theme_color, background_color
  - Service worker registration in layout.tsx
  - Icons: 192x192 and 512x512 in PNG
  - App name: "Stocky", short name: "Stocky"

- [ ] **Step 3: Build scripts**
  - package.json scripts:
    - `cap:android`: `cap add android && cap sync`
    - `cap:ios`: `cap add ios && cap sync`
    - `cap:windows`: `cap add windows && cap sync`
    - `cap:macos`: `cap add macos && cap sync`
    - `build:capacitor`: `next build && npx cap sync`

- [ ] **Step 4: Camera permission for Capacitor**
  - Add @capacitor/camera plugin for mobile barcode scanning
  - Configure Android permissions in capacitor config
  - Configure iOS Info.plist camera permission

- [ ] **Step 5: Verify**
  - Run `next build` — verify static export works
  - Verify PWA manifest is valid
  - Verify service worker is registered
  - Build scripts are properly configured

- [ ] **Step 6: Commit**
  ```bash
  git add .
  git commit -m "feat: add Capacitor configuration, PWA setup, and build scripts"
  ```

---

### Task 14: Polish & Documentation

**Files:**
- Create: `README.md`
- Create: `docs/DEPLOYMENT.md`
- Create: `docs/SUPABASE_SETUP.md`
- Modify: `src/app/(dashboard)/page.tsx` (final dashboard)
- Modify: `src/app/layout.tsx` (final metadata)
- Create: `.env.example`

**Interfaces:**
- Consumes: Everything from Tasks 1-13
- Produces: Complete polished app, README with setup instructions, deployment guide for Vercel + Supabase, .env.example

- [ ] **Step 1: Documentation**
  - README.md: project overview, features, tech stack, setup instructions, deployment guide
  - docs/DEPLOYMENT.md: step-by-step Vercel deployment, Supabase setup, Capacitor build instructions
  - docs/SUPABASE_SETUP.md: how to create Supabase project, run migrations, configure env vars
  - .env.example: all required environment variables

- [ ] **Step 2: Final polish**
  - Add loading skeletons for all data pages
  - Add error boundaries
  - Optimize images (next/image)
  - Add proper metadata (title, description, OG tags)
  - Add a splash/loading screen
  - Ensure all navigation links work
  - Test all CRUD operations end-to-end

- [ ] **Step 3: Final verification**
  - Run `next build` — no errors
  - Run `next lint` — no warnings
  - Test all 11 features from spec
  - Test responsive design at all breakpoints
  - Verify PWA installability
  - Verify all Supabase queries work with RLS

- [ ] **Step 4: Commit**
  ```bash
  git add .
  git commit -m "docs: add README, deployment guide, and final polish"
  ```

---

## Self-Review

**Spec coverage:**
- Task 1 → Project setup (all files)
- Task 2 → Supabase schema + client + migrations + seed (all 9 tables)
- Task 3 → Authentication (login, register, forgot password)
- Task 4 → Layout & Navigation (responsive, Shadcn/ui)
- Task 5 → Dashboard (KPIs, chart, recent movements, alerts)
- Task 6 → Templates & Custom Fields (5 default templates + custom)
- Task 7 → Products (CRUD, photo, dynamic fields, search, pagination)
- Task 8 → Categories (hierarchy) + Suppliers (CRUD)
- Task 9 → Stock Movements (IN/OUT, validation, history)
- Task 10 → Low Stock Alerts (thresholds, acknowledgment, notifications)
- Task 11 → Search, Filters, CSV Export
- Task 12 → Barcode/QR Scanner + Label Printing
- Task 13 → Capacitor (mobile/desktop builds)
- Task 14 → Documentation + Polish

All 11 features covered. ✅

**Step scan:** Every step is a single actionable item. No vague steps. ✅

**Type consistency:** All types defined in Task 6 (templates) referenced in Task 7 (products). All types in Task 9 (movements) reference Product type from Task 7. No conflicts. ✅

**Review Focus covered:**
1. RLS security → Task 2 migrations include RLS policies, Task 2 step 3 verifies
2. Photo upload safety → Task 7 step 3 validates file type/size
3. Template field validation → Task 6 step 1 Zod schemas, step 3 validates
4. Negative stock prevention → Task 9 step 1 validates OUT movements
5. Responsive breakpoints → Task 4 step 4 and Task 14 step 3 verify

---

## Execution Recommendation

I recommend **subagent-driven** because:
- 14 tasks with significant interdependence (schema → client → auth → features)
- Each task needs careful Supabase integration
- Quality of database schema and RLS is critical for security
- Fresh context per task ensures each module is well-architected
