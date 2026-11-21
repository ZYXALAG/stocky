# Task 2 Report: Supabase Schema & Client — Stocky

## Status: ✅ COMPLETE

Commit: `6e2ee9d` — `feat: add Supabase schema, migrations, seed data, and client modules`

## What Was Created

### Migrations (9 files in `supabase/migrations/`)

| # | File | Table(s) | Key Features |
|---|------|----------|-------------|
| 1 | `001_create_profiles.sql` | `profiles` | Links to `auth.users`, RLS + CRUD policies, `updated_at` trigger |
| 2 | `002_create_templates_fields.sql` | `templates`, `fields` | `type` CHECK constraint, `idx_fields_template_id`, `updated_at` trigger |
| 3 | `003_create_categories.sql` | `categories` | Self-referencing `parent_id`, `slug` UNIQUE, `idx_categories_parent_id` |
| 4 | `004_create_suppliers.sql` | `suppliers` | Basic contact fields, RLS + CRUD policies |
| 5 | `005_create_products.sql` | `products` | FKs to categories/suppliers/templates/profiles, `CHECK (base_quantity >= 0)`, 4 indexes, `custom_fields` JSONB, `updated_at` trigger |
| 6 | `006_create_stock_movements.sql` | `stock_movements` | `type CHECK ('IN'/'OUT')`, 3 indexes (product_id, created_at, type) |
| 7 | `007_create_alerts.sql` | `alerts` | Nullable product_id, `acknowledged`/`acknowledged_at` fields |
| 8 | `008_create_settings.sql` | `settings` | Key-value store, `key` PRIMARY KEY, `updated_at` trigger |
| 9 | `009_seed_templates.sql` | — | 5 templates (Electronics, Clothing, Food, Hardware, Personal) with 4 fields each (20 total) |

### Supabase Client Modules (3 files in `src/lib/supabase/`)

| File | Purpose |
|------|---------|
| `client.ts` | `createBrowserClient()` using `@supabase/ssr` — for client components |
| `server.ts` | `createServerClient()` with cookie store — for server components |
| `middleware.ts` | `updateSession()` function using `createServerClient` — for Next.js middleware |

### Auth Middleware (1 file)

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Calls `updateSession()` on every request, matches all paths except static assets |

### Dependency Added

- `@supabase/ssr` installed (alongside existing `@supabase/supabase-js`)

## Verification Results

- ✅ All 9 migrations present and valid
- ✅ RLS enabled on all data tables
- ✅ Authenticated-only policies on all data tables
- ✅ FK constraints: profiles→auth.users, categories→categories (self-ref), products→categories/suppliers/templates/profiles
- ✅ CHECK constraints: `base_quantity >= 0`, `type IN ('IN','OUT')`, field types
- ✅ Indexes: fields(template_id), categories(parent_id), products(category_id, supplier_id, template_id, created_by), stock_movements(product_id, created_at, type)
- ✅ Updated-at triggers: profiles, templates, products, settings
- ✅ Seed data: 5 templates × 4 fields = 20 fields inserted
- ✅ All Supabase client modules follow `@supabase/ssr` pattern
- ✅ Middleware uses `updateSession` from the client module

## No Issues Encountered

Git commit required setting user.email/user.name (done). All SQL and TypeScript files verified.
