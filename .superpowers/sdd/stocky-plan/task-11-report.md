# Task 11 Report: QR Code / Barcode Scanner — Stocky

## Completed

### New Files Created
1. **`src/components/qr/qr-code.tsx`** — QR code generator component using the `qrcode` npm package. Renders on `<canvas>`, supports print mode (3x scale), fallback SVG rendering, and download.
2. **`src/components/qr/qr-code-modal.tsx`** — Full-screen QR code modal with product info, size slider (100–400px), PNG download, print, share (Web Share API / clipboard copy).
3. **`src/components/barcode/barcode-scanner.tsx`** — Barcode/QR scanner using `html5-qrcode`. Supports rear/front camera switching, camera permission checking, error messaging in French, and manual code input fallback.
4. **`src/components/qr/print-labels.tsx`** — A4 label sheet generator with configurable columns, rows, dimensions (mm), and toggle options for price/quantity/description on labels. Preview and print via new window.
5. **`src/lib/products.ts`** — SKU generation utility (`generateSKU`) and QR data helpers (`generateQRData`, `parseQRData`).
6. **`src/lib/camera.ts`** — Camera availability checking (`checkCameraPermission`) and stream acquisition (`getCameraStream`).

### Modified Files
1. **`src/components/products/product-detail.tsx`** — Added QR code preview in sidebar, "Scanner" and "QR Code" buttons in header, integrated QRCodeModal and BarcodeScanner components.
2. **`src/components/products/product-form.tsx`** — Added SKU generation button for existing products.
3. **`src/app/(dashboard)/dashboard/produits/page.tsx`** — Added "Étiquettes" (print labels) and "Scanner" buttons in header, integrated QRCodeModal, BarcodeScanner, and PrintLabels components.
4. **`src/app/(dashboard)/dashboard/mouvements/page.tsx`** — Added "Scanner" button in header, integrated BarcodeScanner with QR data parsing (auto-detects products from scanned QR codes, shows toast with product info).
5. **`src/app/globals.css`** — Added `@media print` styles: hides nav/toolbar, ensures color-adjust for print, label grid/avoid-break styles.

### Dependencies Installed
- `qrcode` (v1.5.4) — QR code generation
- `@types/qrcode` — TypeScript definitions

## Verified
- `npx next build` compiles successfully (13 routes generated, no type errors)
- The standalone copy warning is a pre-existing unrelated issue (ENOENT for traced files)

## Notes
- `html5-qrcode` is dynamically imported in scanner components (tree-shaken, not bundled at build time)
- QR codes encode JSON with `{ productId, templateId, name }` for structured scanning
- Manual code input is available in the scanner as fallback when camera is unavailable
- Print labels use CSS grid layout targeting A4 format
