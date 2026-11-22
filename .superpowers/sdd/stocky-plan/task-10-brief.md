# Task 10 Brief — Search, Filters & Export — Stocky

## Goal
Build global search, advanced filtering, and export functionality — CSV/JSON export for products and movements, multi-field search with highlighting.

## Requirements

### 1. Search Hook
Create `src/lib/hooks/use-global-search.ts` with:
- `useGlobalSearch(entity: 'products' | 'movements' | 'templates')`
- Debounced search (300ms) across multiple fields
- Returns `{ query, setQuery, results, loading, clear }`
- Uses Supabase `.search()` for ILIKE queries

### 2. SearchBar Component
Create `src/components/search/search-bar.tsx` — Client component with:
- Global search input with icon
- Debounced search (300ms)
- Clear button (X icon)
- Results count
- Optional: dropdown with recent searches
- Keyboard shortcut (Ctrl+K / Cmd+K to focus)
- Dependencies: `lucide-react`, `@/lib/hooks/use-global-search`

### 3. Advanced Filters
Create `src/components/filters/advanced-filters.tsx` — Client component with:
- Collapsible filter panel (open/close toggle)
- Multi-select for categories
- Date range picker (from/to)
- Price range slider (min/max)
- Status/stock level filter (in stock / low stock / out of stock)
- Supplier filter (multi-select)
- Reset filters button
- Applies to both products and movements pages
- Dependencies: `lucide-react`, `@/lib/supabase/client`

### 4. Export Utilities
Create `src/lib/export.ts` with:
- `exportToCSV(data: any[], filename: string)`: converts data array to CSV blob and triggers download
- `exportToJSON(data: any[], filename: string)`: converts data array to JSON blob and triggers download
- `exportTableToCSV(tableId: string, filename: string)`: extracts HTML table and converts to CSV
- Helper: `sanitizeCSV(value: any)`: escapes commas, quotes, newlines

### 5. Export Button Component
Create `src/components/export/export-button.tsx` — Client component with:
- Dropdown button with export options: CSV, JSON, Excel (as CSV with .xlsx extension)
- "Export selected" (if items are selected) vs "Export all"
- Shows loading state during export
- Shows toast notification on success/error
- Dependencies: `lucide-react`, `@/lib/export`, `react-hot-toast`

### 6. Product Table Enhancements
Update `src/components/products/product-list.tsx` to include:
- Search bar integrated
- Advanced filter toggle button
- Export buttons (CSV, JSON)
- "Export selected" when items are checked
- Column sorting (click headers)
- Selected items count display

### 7. Movements Table Enhancements
Update `src/components/movements/movement-list.tsx` to include:
- Search bar integrated
- Advanced filter toggle button
- Export buttons (CSV, JSON)
- Date range filter pre-applied to movements
- Movement type filter chips

### 8. Keyboard Shortcuts
Create `src/lib/hooks/use-keyboard-shortcuts.ts` with:
- `Ctrl+K` (Cmd+K on Mac): Focus global search
- `Ctrl+E`: Toggle export menu (on list pages)
- `Escape`: Close any open modals/menus
- Dependencies: `react`

### 9. Update Product List Page
Update `src/app/(dashboard)/dashboard/produits/page.tsx` to integrate:
- SearchBar at top
- Filter toggle + Export buttons
- Column sorting on product table
- Selected items count with bulk actions

### 10. Update Movements List Page
Update `src/app/(dashboard)/dashboard/mouvements/page.tsx` to integrate:
- SearchBar at top
- Filter toggle + Export buttons
- Movement type filter chips (In / Out / Adjustment / Transfer)
- Date range filter

## Dependencies to Add
- `@types/xlsx` (for Excel export) or use custom CSV-to-Excel
- `react-hot-toast` (if not already installed) for export notifications

## Build Verification
Run `npx next build` and verify:
- All pages compile
- Search works across products and movements
- Export downloads CSV/JSON files correctly
- Zero TypeScript errors

## Commit
Commit: `feat(search): Global search, advanced filters, export (CSV/JSON) — bulk actions, keyboard shortcuts`

## Files to Create/Modify
1. `src/lib/hooks/use-global-search.ts` — NEW
2. `src/lib/hooks/use-keyboard-shortcuts.ts` — NEW
3. `src/components/search/search-bar.tsx` — NEW
4. `src/components/filters/advanced-filters.tsx` — NEW
5. `src/components/export/export-button.tsx` — NEW
6. `src/lib/export.ts` — NEW
7. `src/components/products/product-list.tsx` — MODIFY (search + filters + export + sorting)
8. `src/components/movements/movement-list.tsx` — MODIFY (search + filters + export)
9. `src/app/(dashboard)/dashboard/produits/page.tsx` — MODIFY (integrate new components)
10. `src/app/(dashboard)/dashboard/mouvements/page.tsx` — MODIFY (integrate new components)
