# Task 8 Brief — Stock Movements — Stocky

## Goal
Build the Stock Movements tracking system — record every stock entry, exit, adjustment, and transfer between locations.

## Requirements

### 1. Type Definitions
Create `src/types/stock-movement.ts` with:
- `StockMovement` interface: id, product_id, template_id, user_id, movement_type ('in' | 'out' | 'adjustment' | 'transfer'), quantity, location (from/to for transfers), reference (PO, invoice, etc.), notes, created_at, updated_at
- `MovementType` enum
- `StockMovementFilters`: { type?, productId?, dateFrom?, dateTo?, user? }
- Helper functions: `formatMovementType(type)`, `getMovementColor(type)`

### 2. Movement Form Component
Create `src/components/movements/movement-form.tsx` — Client component with:
- React-hook-form + zod validation
- Product dropdown (searchable, from Supabase)
- Movement type selector (in/out/adjustment/transfer)
- Quantity input (validated > 0)
- Reference field (PO/invoice number)
- Location fields (from/to for transfers)
- Notes textarea
- Toast on submit
- Create and edit modes
- Dependencies: `@/lib/supabase/client`, `react-hook-form`, `zod`, `lucide-react`

### 3. Movement List Component
Create `src/components/movements/movement-list.tsx` — Client component with:
- Paginated table (15 items/page)
- Filters: type, product, date range
- Sort by date (descending)
- Color-coded badges per movement type
- Entry/exit arrows for quantity
- Click row to see detail
- Delete with confirmation
- Dependencies: `@/lib/supabase/client`, `lucide-react`

### 4. Movement Detail Component
Create `src/components/movements/movement-detail.tsx` — Client component with:
- Full movement info display
- Product name + photo
- Movement type + quantity
- Reference + location info
- Notes display
- Created by + date
- Edit/Delete actions
- Dependencies: `@/lib/supabase/client`, `lucide-react`

### 5. Movements Page
Create `src/app/(dashboard)/dashboard/mouvements/page.tsx` — Client component with:
- State for current view (list/detail/new/edit)
- "New Movement" button (top right)
- Back navigation from detail to list
- Form dialog for create/edit
- Pass selected movement to detail view
- Load initial data from Supabase (movements + products)
- Dependencies: `@/lib/supabase/client`, `react-hook-form`, `zod`, `lucide-react`

### 6. Update Sidebar
Update sidebar navigation to include "Mouvements" link (`/dashboard/mouvements`) with a relevant icon (e.g. `ArrowUpRight` or `GitBranch`).

### 7. Update Layout
Update `(dashboard)/layout.tsx` to include the movements route in the navigation items.

## Dependencies to Add
- `react-select` or use shadcn `Command` + `Popover` for searchable product dropdown
- If not using react-select, use shadcn `Command` component from `@/components/ui/command`

## Build Verification
Run `npx next build` and verify:
- All pages compile
- `/dashboard/mouvements` route works
- Zero TypeScript errors

## Commit
Commit: `feat(movements): Stock Movements — track entries, exits, adjustments, and transfers`

## Files to Create/Modify
1. `src/types/stock-movement.ts` — NEW
2. `src/components/movements/movement-form.tsx` — NEW
3. `src/components/movements/movement-list.tsx` — NEW
4. `src/components/movements/movement-detail.tsx` — NEW
5. `src/app/(dashboard)/dashboard/mouvements/page.tsx` — NEW
6. `src/components/layout/sidebar.tsx` — MODIFY (add movements link)
7. `src/app/(dashboard)/layout.tsx` — MODIFY (add movements to nav)
8. `src/lib/utils.ts` — MODIFY (add formatMovementType, getMovementColor)
