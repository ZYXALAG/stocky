# Task 11 Brief — QR Code / Barcode Scanner — Stocky

## Goal
Build QR code generation and barcode scanner functionality — generate QR codes for products, scan barcodes/QR codes via camera to lookup or create products.

## Requirements

### 1. QR Code Generation Component
Create `src/components/qr/qr-code.tsx` — Client component with:
- Generates a QR code from a string (product ID, SKU, or URL)
- Uses a lightweight QR code library (no heavy dependencies)
- Props: `data` (string), `size` (number, default 200), `includeLabel` (boolean)
- Renders as canvas/SVG
- Print-ready (300dpi equivalent)
- Options: download QR as PNG
- Dependencies: `qrcode` (lightweight npm package ~5KB)

### 2. QR Code Generation Modal
Create `src/components/qr/qr-code-modal.tsx` — Client component with:
- Opens a dialog with the product QR code
- Shows product name, SKU, current quantity
- Download buttons: PNG, SVG, Print
- "Share" button (Web Share API on mobile)
- Bulk QR generation (select multiple products → generate sheet)
- Dependencies: `lucide-react`, `@/components/ui/dialog`

### 3. QR Code in Product Detail
Update `src/components/products/product-detail.tsx` to include:
- QR code display in the product detail panel
- "Print Label" button
- "Scan to Edit" option (generate shareable link with product ID)

### 4. Barcode Scanner Component
Create `src/components/barcode/barcode-scanner.tsx` — Client component with:
- Uses device camera (getUserMedia) for scanning
- Supports both QR codes and 1D barcodes (Code 128, EAN-13, UPC-A)
- Uses `html5-qrcode` library for scanning
- Real-time detection feedback (visual border on detected code)
- Auto-submit on successful scan
- Fallback: manual input field for barcode
- Manual QR code input as alternative
- Dependencies: `html5-qrcode`, `lucide-react`

### 5. Scanner Integration — Scan to Find
Update `src/app/(dashboard)/dashboard/produits/page.tsx` to include:
- "Scan" button in the toolbar (next to search)
- Opens scanner modal
- On successful scan: looks up product by SKU/ID in barcode
- Navigates to product detail page or shows create-new if not found
- "Create new product from scan" option when no match found

### 6. Scanner Integration — Scan to Add Stock
Update `src/app/(dashboard)/dashboard/mouvements/page.tsx` to include:
- "Scan" button on the movement form
- Scans barcode and auto-fills the product field
- Pre-selects "In" movement type (can be changed)
- Quick quantity entry after scan

### 7. Barcode/QR Code Print Labels
Create `src/components/qr/print-labels.tsx` — Client component with:
- Generates printable label sheet (A4 format)
- Supports multiple products (bulk)
- Label format: QR code + product name + SKU + price
- CSS print styles for proper page breaks
- Preview in modal, print button
- Dependencies: `lucide-react`

### 8. Product SKU Generation
Update `src/lib/products.ts` (or create if not exists) with:
- `generateSKU(templateId: string): string`: generates unique SKU like `SKU-{template}-{4-digit}`
- `generateQRData(productId: string): string`: formats data for QR code (JSON with product info)
- `parseQRData(data: string): { productId: string, templateId: string }`: parses QR data

### 9. Update Product Form
Update `src/components/products/product-form.tsx` to include:
- Auto-generate SKU button
- Display SKU in form (editable)
- "Generate QR" button next to SKU field
- Barcode/QR code input field for scanning on mobile

### 10. Camera Permissions
Add a camera permission check component:
- `src/lib/camera.ts`: checks if camera is available and permissions granted
- Shows friendly error message if camera not accessible
- Fallback to manual input when camera unavailable

## Dependencies to Add
- `qrcode` — QR code generation (lightweight, ~5KB)
- `html5-qrcode` — Barcode/QR scanning via camera (~150KB)

## Build Verification
Run `npx next build` and verify:
- All pages compile
- QR codes render correctly
- Camera/scan UI works (test in browser)
- Print labels CSS works
- Zero TypeScript errors

## Commit
Commit: `feat(qr): QR Code generation, barcode scanning, and print labels — camera-based lookup, SKU generation, bulk print`

## Files to Create/Modify
1. `src/components/qr/qr-code.tsx` — NEW (QR generator)
2. `src/components/qr/qr-code-modal.tsx` — NEW (QR dialog)
3. `src/components/qr/print-labels.tsx` — NEW (print labels)
4. `src/components/barcode/barcode-scanner.tsx` — NEW (camera scanner)
5. `src/lib/products.ts` — NEW (SKU/QR utilities)
6. `src/lib/camera.ts` — NEW (camera permissions check)
7. `src/components/products/product-detail.tsx` — MODIFY (add QR code display)
8. `src/components/products/product-form.tsx` — MODIFY (add SKU + QR generation)
9. `src/app/(dashboard)/dashboard/produits/page.tsx` — MODIFY (add scan button + lookup)
10. `src/app/(dashboard)/dashboard/mouvements/page.tsx` — MODIFY (add scan on form)
11. `src/app/globals.css` — MODIFY (add print styles for labels)
