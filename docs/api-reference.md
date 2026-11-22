# API Reference

This document describes the Supabase database schema used by Stocky, including table structures, relationships, and example queries.

> All tables have Row Level Security (RLS) enabled. Every policy targets `TO authenticated`, ensuring only logged-in users can access data.

## Tables

### `profiles`

User profile data, linked to `auth.users` via the `id` column.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, REFERENCES `auth.users(id)` ON DELETE CASCADE | Supabase Auth user ID |
| `full_name` | TEXT | NULLABLE | User's display name |
| `avatar_url` | TEXT | NULLABLE | URL to profile photo |
| `role` | TEXT | DEFAULT 'user' | User role |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update time (auto-updated) |

**Indexes:** None (primary key)

**Trigger:** `set_updated_at` — auto-updates `updated_at` on row modification.

**Example Queries:**

```sql
-- Get current user's profile
SELECT * FROM profiles WHERE id = auth.uid();

-- Update display name
UPDATE profiles SET full_name = 'Jane Doe' WHERE id = auth.uid();
```

---

### `templates`

Custom field schemas for different product types (e.g., "Electronics", "Clothing").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Template ID |
| `name` | TEXT | NOT NULL | Template name |
| `description` | TEXT | NULLABLE | Template description |
| `icon` | TEXT | NULLABLE | Icon identifier |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp (auto-updated) |

**Indexes:** None

**Trigger:** `set_updated_at` — auto-updates `updated_at`.

**Example Queries:**

```sql
-- List all templates
SELECT * FROM templates ORDER BY created_at DESC;

-- Create a new template
INSERT INTO templates (name, description, icon)
VALUES ('Electronics', 'Product type for electronic devices', 'monitor');
```

---

### `fields`

Custom fields belonging to a template.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Field ID |
| `template_id` | UUID | NOT NULL, REFERENCES `templates(id)` ON DELETE CASCADE | Parent template |
| `name` | TEXT | NOT NULL | Programmatic field name |
| `type` | TEXT | NOT NULL, CHECK IN ('text', 'number', 'date', 'select', 'checkbox', 'textarea', 'currency') | Field type |
| `label` | TEXT | NOT NULL | Display label |
| `required` | BOOLEAN | DEFAULT false | Whether this field is required |
| `options` | JSONB | NULLABLE | Options for 'select' type fields |
| `order` | INTEGER | DEFAULT 0 | Display order |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:** `idx_fields_template_id` on `template_id`

**Example Queries:**

```sql
-- Get all fields for a template
SELECT * FROM fields WHERE template_id = '<uuid>' ORDER BY "order";

-- Create a field for a template
INSERT INTO fields (template_id, name, type, label, required, options, "order")
VALUES ('<template-id>', 'serial_number', 'text', 'Serial Number', true, NULL, 1);

-- Create a select field
INSERT INTO fields (template_id, name, type, label, required, options, "order")
VALUES ('<template-id>', 'color', 'select', 'Color', false, '["red", "blue", "green"]'::jsonb, 2);
```

---

### `categories`

Hierarchical product categories with self-referencing parent.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Category ID |
| `name` | TEXT | NOT NULL | Category name |
| `slug` | TEXT | UNIQUE | URL-friendly identifier |
| `description` | TEXT | NULLABLE | Category description |
| `parent_id` | UUID | REFERENCES `categories(id)` ON DELETE SET NULL | Parent category (null for top-level) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:** `idx_categories_parent_id` on `parent_id`

**Example Queries:**

```sql
-- List top-level categories (no parent)
SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name;

-- List all categories with parent name
SELECT c.id, c.name, c.slug, p.name AS parent_name
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY p.name, c.name;

-- Create a subcategory
INSERT INTO categories (name, slug, parent_id, description)
VALUES ('Phones', 'phones', '<parent-category-id>', 'Mobile phones');
```

---

### `suppliers`

Supplier/vendor management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Supplier ID |
| `name` | TEXT | NOT NULL | Supplier company name |
| `email` | TEXT | NULLABLE | Contact email |
| `phone` | TEXT | NULLABLE | Contact phone |
| `address` | TEXT | NULLABLE | Physical address |
| `website` | TEXT | NULLABLE | Company website |
| `contact_person` | TEXT | NULLABLE | Primary contact name |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:** None

**Example Queries:**

```sql
-- List all suppliers
SELECT * FROM suppliers ORDER BY name;

-- Create a supplier
INSERT INTO suppliers (name, email, phone, address, website, contact_person)
VALUES ('Acme Corp', 'info@acme.com', '+33 1 23 45 67 89', '123 Main St', 'https://acme.com', 'John Smith');

-- Get suppliers with most products
SELECT s.*, COUNT(p.id) AS product_count
FROM suppliers s
LEFT JOIN products p ON p.supplier_id = s.id
GROUP BY s.id ORDER BY product_count DESC;
```

---

### `products`

Core inventory items with custom fields.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Product ID |
| `name` | TEXT | NOT NULL | Product name |
| `description` | TEXT | NULLABLE | Product description |
| `photo_url` | TEXT | NULLABLE | Product photo URL |
| `category_id` | UUID | REFERENCES `categories(id)` ON DELETE SET NULL | Product category |
| `supplier_id` | UUID | REFERENCES `suppliers(id)` ON DELETE SET NULL | Product supplier |
| `template_id` | UUID | REFERENCES `templates(id)` ON DELETE SET NULL | Custom field template |
| `base_quantity` | INTEGER | DEFAULT 0, CHECK ≥ 0 | Current stock quantity |
| `base_cost_price` | DECIMAL | NULLABLE | Unit cost price |
| `base_selling_price` | DECIMAL | NULLABLE | Unit selling price |
| `custom_fields` | JSONB | DEFAULT '{}' | Template-defined custom fields |
| `alert_threshold` | INTEGER | DEFAULT 5 | Low stock threshold |
| `created_by` | UUID | REFERENCES `profiles(id)` ON DELETE SET NULL | Creator |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp (auto-updated) |

**Indexes:** `idx_products_category_id`, `idx_products_supplier_id`, `idx_products_template_id`, `idx_products_created_by`

**Trigger:** `set_updated_at` — auto-updates `updated_at`.

**Example Queries:**

```sql
-- List all products with category and supplier names
SELECT p.*, c.name AS category_name, s.name AS supplier_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
ORDER BY p.name;

-- Low stock products (below threshold)
SELECT p.*, c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.base_quantity < p.alert_threshold
ORDER BY p.base_quantity ASC;

-- Create a product
INSERT INTO products (name, description, category_id, supplier_id, template_id, base_quantity, base_cost_price, base_selling_price, custom_fields, alert_threshold)
VALUES ('Widget X', 'A high-quality widget', '<cat-id>', '<sup-id>', '<tmpl-id>', 100, 5.00, 12.99, '{"serial": "ABC123", "color": "blue"}'::jsonb, 10);
```

---

### `stock_movements`

Audit trail of stock IN/OUT movements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Movement ID |
| `product_id` | UUID | NOT NULL, REFERENCES `products(id)` ON DELETE CASCADE | Affected product |
| `type` | TEXT | NOT NULL, CHECK IN ('IN', 'OUT') | Movement direction |
| `quantity` | INTEGER | NOT NULL | Number of units |
| `reference` | TEXT | NULLABLE | Reference number (e.g., PO number) |
| `justification` | TEXT | NULLABLE | Reason for movement |
| `created_by` | UUID | REFERENCES `profiles(id)` ON DELETE SET NULL | Who created the movement |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |

**Indexes:** `idx_stock_movements_product_id`, `idx_stock_movements_created_at`, `idx_stock_movements_type`

**Example Queries:**

```sql
-- Latest movements for a product
SELECT * FROM stock_movements
WHERE product_id = '<product-uuid>'
ORDER BY created_at DESC
LIMIT 20;

-- All IN movements this month
SELECT * FROM stock_movements
WHERE type = 'IN' AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- Net stock change for a product
SELECT product_id,
  SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) AS total_in,
  SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) AS total_out
FROM stock_movements
WHERE product_id = '<product-uuid>'
GROUP BY product_id;
```

---

### `alerts`

Low stock alerts for products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Alert ID |
| `product_id` | UUID | REFERENCES `products(id)` ON DELETE SET NULL | Product with low stock |
| `threshold` | INTEGER | NOT NULL | The threshold that triggered this alert |
| `acknowledged` | BOOLEAN | DEFAULT false | Whether the alert was acknowledged |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Alert creation time |
| `acknowledged_at` | TIMESTAMPTZ | NULLABLE | When acknowledged |

**Indexes:** None

**Example Queries:**

```sql
-- Unacknowledged alerts
SELECT a.*, p.name AS product_name, p.base_quantity
FROM alerts a
JOIN products p ON a.product_id = p.id
WHERE a.acknowledged = false
ORDER BY a.created_at DESC;

-- Acknowledge an alert
UPDATE alerts
SET acknowledged = true, acknowledged_at = NOW()
WHERE id = '<alert-uuid>' AND acknowledged = false;

-- Alert history per product
SELECT p.name, COUNT(*) AS alert_count
FROM alerts a
JOIN products p ON a.product_id = p.id
GROUP BY p.name ORDER BY alert_count DESC;
```

---

### `settings`

Key-value store for application settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | TEXT | PRIMARY KEY | Setting key |
| `value` | JSONB | DEFAULT '{}' | Setting value |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp (auto-updated) |

**Indexes:** Primary key on `key`

**Trigger:** `set_settings_updated_at` — auto-updates `updated_at`.

**Example Queries:**

```sql
-- Get all settings
SELECT * FROM settings ORDER BY key;

-- Update a setting
INSERT INTO settings (key, value)
VALUES ('theme', '"dark"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = '"dark"'::jsonb, updated_at = NOW();

-- Store a user preference
INSERT INTO settings (key, value)
VALUES ('currency', '"EUR"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = '"EUR"'::jsonb, updated_at = NOW();
```

## Relationships

```
profiles (1) ──── (N) products
profiles (1) ──── (N) stock_movements
categories (1) ──── (N) categories (self-referencing, parent_id)
categories (1) ──── (N) products
suppliers (1) ──── (N) products
templates (1) ──── (N) fields
templates (1) ──── (N) products
products (1) ──── (N) stock_movements
products (1) ──── (N) alerts
```

## Custom Functions & Triggers

### `update_updated_at_column()`

A reusable PL/pgSQL function that sets `updated_at = NOW()` on row modification. Used by `profiles`, `templates`, `products`, and `settings` tables.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `set_updated_at` Trigger

Applied on `profiles`, `templates`, `products`, and `settings` tables as:

```sql
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON <table_name>
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Authentication (Supabase Auth)

Authentication is handled entirely by Supabase Auth. No custom auth endpoints are needed.

### Client-Side Auth (via `@supabase/ssr`)

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Sign up
await supabase.auth.signUp({ email, password })

// Sign in
await supabase.auth.signInWithPassword({ email, password })

// Sign out
await supabase.auth.signOut()

// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Update user profile
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

### Auth-Protected Routes (App Router)

The app uses Next.js route groups:
- `(auth)` — Public auth pages (login, register, forgot-password, reset-password, verify)
- `(dashboard)` — Protected app pages (dashboard, products, movements, etc.)

Protected pages check the session in client components and redirect unauthenticated users.

## Security

- **Row Level Security (RLS):** Every table has RLS enabled; all policies restrict access to `authenticated` users
- **Cascade deletes:** Foreign keys use `ON DELETE SET NULL` or `ON DELETE CASCADE` to maintain referential integrity
- **CHECK constraints:** Enforced at the database level (e.g., `stock_movements.type IN ('IN', 'OUT')`, `base_quantity >= 0`)
- **No API endpoints:** Stocky accesses Supabase directly from the frontend via `@supabase/supabase-js`; no custom backend API routes are needed
