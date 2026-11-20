# Task 2: Supabase Schema & Client — Stocky

## Context
Stocky is a universal inventory management app. Task 1 completed the project scaffolding. Now we need the Supabase schema, migrations, seed data, and client modules.

WORKING DIRECTORY: C:/Users/adrig/stocky/

## Requirements (verbatim from plan)

### Step 1: Write migrations
Create ALL migration files in `supabase/migrations/`:

**001_create_profiles.sql:**
- profiles table linked to auth.users
- Columns: id (UUID PK, references auth.users), full_name (TEXT), avatar_url (TEXT), role (TEXT DEFAULT 'user'), created_at (TIMESTAMP), updated_at (TIMESTAMP)
- Enable RLS, add policies for authenticated users to CRUD their own data

**002_create_templates_fields.sql:**
- templates: id (UUID PK), name (TEXT NOT NULL), description (TEXT), icon (TEXT), created_at (TIMESTAMP), updated_at (TIMESTAMP)
- fields: id (UUID PK), template_id (UUID FK → templates), name (TEXT NOT NULL), type (TEXT — one of: text, number, date, select, checkbox, textarea, currency), label (TEXT NOT NULL), required (BOOLEAN DEFAULT false), options (JSONB), order (INTEGER DEFAULT 0), created_at (TIMESTAMP)
- Enable RLS, add policies for authenticated users
- Index on fields(template_id)

**003_create_categories.sql:**
- categories: id (UUID PK), name (TEXT NOT NULL), slug (TEXT UNIQUE), description (TEXT), parent_id (UUID FK → categories.id NULLABLE), created_at (TIMESTAMP)
- Enable RLS, policies for CRUD own data
- Index on parent_id

**004_create_suppliers.sql:**
- suppliers: id (UUID PK), name (TEXT NOT NULL), email (TEXT), phone (TEXT), address (TEXT), website (TEXT), contact_person (TEXT), created_at (TIMESTAMP)
- Enable RLS, policies for CRUD own data

**005_create_products.sql:**
- products: id (UUID PK), name (TEXT NOT NULL), description (TEXT), photo_url (TEXT), category_id (UUID FK → categories NULLABLE), supplier_id (UUID FK → suppliers NULLABLE), template_id (UUID FK → templates NULLABLE), base_quantity (INTEGER DEFAULT 0), base_cost_price (DECIMAL), base_selling_price (DECIMAL), custom_fields (JSONB DEFAULT '{}'), alert_threshold (INTEGER DEFAULT 5), created_by (UUID FK → profiles.id), created_at (TIMESTAMP), updated_at (TIMESTAMP)
- Enable RLS, policies for CRUD own data
- Indexes on category_id, supplier_id, template_id, created_by
- Check constraint: base_quantity >= 0

**006_create_stock_movements.sql:**
- stock_movements: id (UUID PK), product_id (UUID FK → products), type (TEXT — one of: IN, OUT), quantity (INTEGER NOT NULL), reference (TEXT), justification (TEXT), created_by (UUID FK → profiles.id), created_at (TIMESTAMP)
- Enable RLS, policies for CRUD own data
- Index on product_id, created_at, type

**007_create_alerts.sql:**
- alerts: id (UUID PK), product_id (UUID FK → products NULLABLE), threshold (INTEGER NOT NULL), acknowledged (BOOLEAN DEFAULT false), created_at (TIMESTAMP), acknowledged_at (TIMESTAMP)
- Enable RLS, policies for own data

**008_create_settings.sql:**
- settings: key (TEXT PRIMARY KEY), value (JSONB DEFAULT '{}'), updated_at (TIMESTAMP)

**009_seed_templates.sql:**
Insert 5 default templates + their fields:
- Electronics: fields = serial_number(text), brand(text), warranty_months(number), purchase_date(date)
- Clothing: fields = size(select: XS|S|M|L|XL), color(text), material(text), season(select: Spring|Summer|Autumn|Winter)
- Food: fields = expiry_date(date), quantity_unit(select: kg|g|L|ml|units), storage_temp(text), batch_number(text)
- Hardware: fields = sku(text), weight_kg(number), dimensions(text), min_stock(number)
- Personal: fields = notes(textarea), purchase_date(date), value(currency), location(text)

ALL tables: add proper RLS policies (authenticated can INSERT/SELECT/UPDATE/DELETE their own rows only)
ALL tables: add created_at/triggers for auto-updated_at where needed

### Step 2: Create Supabase client modules
- src/lib/supabase/client.ts: createBrowserClient() — uses @supabase/ssr pattern with cookie strategy
- src/lib/supabase/server.ts: createServerClient() — for server components
- src/lib/supabase/middleware.ts: createMiddleWareClient() — for Next.js middleware
- middleware.ts: protect routes under / except /auth/login, /auth/register, /auth/reset, /auth/verify

### Step 3: Verify migrations
- All SQL valid (FK constraints, RLS policies)
- Seed data has proper template fields for each of 5 templates
- RLS policies: authenticated users can only access own data

### Step 4: Commit
```bash
git add .
git commit -m "feat: add Supabase schema, migrations, seed data, and client modules"
```

## Interfaces
- Consumes: Project structure from Task 1 (src/lib/ exists, src/app/ exists)
- Produces: Complete Supabase schema with all 9 tables, RLS policies, Supabase client (client + server), middleware for auth session, seed data for 5 default templates

## Constraints
- Use UUIDs for all primary keys (gen_random_uuid())
- All timestamps use NOW() for defaults
- RLS policies use auth.uid() = created_by or auth.uid() = id
- The @supabase/ssr package must be installed (import from @supabase/ssr)
- middleware.ts must use the @supabase/ssr middleware pattern
- Use forward-slash paths
- SQL must be production-ready (no placeholders that need substitution)

## Report File
Write report to: `C:/Users/adrig/stocky/.superpowers/sdd/stocky-plan/task-2-report.md`
