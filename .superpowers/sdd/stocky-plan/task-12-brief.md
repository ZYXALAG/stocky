# Task 12 Brief — Suppliers & Categories — Stocky

## Goal
Build complete Suppliers and Categories management — CRUD for both, assign them to products, create dedicated listing pages with filtering.

## Requirements

### 1. Supplier Type Definitions
Create `src/types/supplier.ts` with:
- `Supplier` interface: id, name, contact_person, email, phone, address, city, postal_code, country, website, notes, created_at, updated_at
- `SupplierFormData`: all fields except id/timestamps for form input
- `SupplierWithProducts`: Supplier + products_count
- Helper: `getSupplierAvatar(initials: string): string` (returns SVG avatar data)
- Validation schema using zod

### 2. Supplier Form Component
Create `src/components/suppliers/supplier-form.tsx` — Client component with:
- Form for creating/editing suppliers
- Fields: name (required), contact_person, email, phone, address, city, postal_code, country, website, notes
- Country dropdown with common countries (or use a country code selector)
- Form validation with zod
- Submit with toast notification
- Dependencies: `@/lib/supabase/client`, `zod`, `react-hook-form`, `@/components/ui/*`

### 3. Supplier List Component
Create `src/components/suppliers/supplier-list.tsx` — Client component with:
- Table of suppliers with columns: avatar, name, contact_person, email, phone, products_count, actions
- Search by name/email/phone
- Sort by name, products_count
- Click to open detail view
- Edit and delete actions
- "Add Supplier" button
- Pagination (10/page)
- Dependencies: `@/lib/supabase/client`, `lucide-react`

### 4. Supplier Detail Component
Create `src/components/suppliers/supplier-detail.tsx` — Client component with:
- Full supplier information display
- Associated products list (products from this supplier)
- Recent stock movements for this supplier's products
- Edit and delete buttons
- "Add Product from Supplier" quick action
- Dependencies: `@/lib/supabase/client`

### 5. Suppliers Page
Create `src/app/(dashboard)/dashboard/fournisseurs/page.tsx` — Client component with:
- Tab navigation: List | Detail
- List tab: supplier-list component
- Detail tab: supplier-detail component
- Load data from Supabase suppliers table
- Dependencies: `@/lib/supabase/client`

### 6. Category Type Definitions
Create `src/types/category.ts` with:
- `Category` interface: id, name, description, parent_id (nullable, for subcategories), icon (string), color (hex), product_count, created_at, updated_at
- `CategoryFormData`: all fields except id/timestamps
- `CategoryWithChildren`: Category + children[]
- Validation schema using zod

### 7. Category Form Component
Create `src/components/categories/category-form.tsx` — Client component with:
- Form for creating/editing categories
- Fields: name (required), description, parent_id (select for hierarchical categories), icon (select from lucide-react icons), color (color picker)
- Color picker with preset colors + custom input
- Icon picker with common icons
- Parent category select (exclude self and descendants from options)
- Dependencies: `@/lib/supabase/client`, `lucide-react`

### 8. Category List Component
Create `src/components/categories/category-list.tsx` — Client component with:
- Tree/grid view of categories (supports hierarchy)
- Columns: icon, name, description, product_count, actions
- Search by name
- Color-coded badges for category color
- Expand/collapse for subcategories
- Edit and delete actions
- "Add Category" button
- Dependencies: `@/lib/supabase/client`, `lucide-react`

### 9. Category Detail Component
Create `src/components/categories/category-detail.tsx` — Client component with:
- Full category information display
- Product count and list
- Child categories list
- Recent products in this category
- Edit and delete buttons
- Dependencies: `@/lib/supabase/client`

### 10. Categories Page
Create `src/app/(dashboard)/dashboard/categories/page.tsx` — Client component with:
- Tab navigation: List | Detail
- List tab: category-list component
- Detail tab: category-detail component
- Load data from Supabase categories table
- Dependencies: `@/lib/supabase/client`

### 11. Update Product Form
Update `src/components/products/product-form.tsx` to include:
- Supplier select dropdown (populated from Supabase)
- Category select dropdown (populated from Supabase)
- Both required or optional based on template settings
- Dependencies: `@/lib/supabase/client`

### 12. Update Sidebar
Update `src/components/layout/sidebar.tsx` to include:
- Suppliers section with "Fournisseurs" link (`/dashboard/fournisseurs`)
- Categories section with "Catégories" link (`/dashboard/categories`)
- Icons: StoreIcon for suppliers, TagIcon for categories

### 13. Update Seed Data
Update the seed migration or add a seed script with:
- 3-5 sample suppliers
- 3-5 sample categories (with one parent + some children)
- Assign suppliers/categories to existing products

## Dependencies to Add
- `country-data` or similar lightweight country list (or hardcode common countries)

## Build Verification
Run `npx next build` and verify:
- All pages compile
- `/dashboard/fournisseurs` route works
- `/dashboard/categories` route works
- Products can be assigned to suppliers/categories
- Zero TypeScript errors

## Commit
Commit: `feat(suppliers-categories): Suppliers & Categories management — CRUD, hierarchy, product assignment`

## Files to Create/Modify
1. `src/types/supplier.ts` — NEW
2. `src/types/category.ts` — NEW
3. `src/components/suppliers/supplier-form.tsx` — NEW
4. `src/components/suppliers/supplier-list.tsx` — NEW
5. `src/components/suppliers/supplier-detail.tsx` — NEW
6. `src/app/(dashboard)/dashboard/fournisseurs/page.tsx` — NEW
7. `src/components/categories/category-form.tsx` — NEW
8. `src/components/categories/category-list.tsx` — NEW
9. `src/components/categories/category-detail.tsx` — NEW
10. `src/app/(dashboard)/dashboard/categories/page.tsx` — NEW
11. `src/components/products/product-form.tsx` — MODIFY (add supplier/category selects)
12. `src/components/layout/sidebar.tsx` — MODIFY (add links)
13. `supabase/migrations/XXX_seed_suppliers_categories.sql` — NEW or MODIFY (seed data)
