'use client';

import { useState, useCallback, useRef } from 'react';
import { Printer, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product } from '@/types/product';
import { QRCode } from './qr-code';
import { generateQRData } from '@/lib/products';

interface PrintLabelsProps {
  products: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPreview?: (html: string) => void;
}

export function PrintLabels({ products, open, onOpenChange }: PrintLabelsProps) {
  const [preview, setPreview] = useState(false);
  const [labelColumns, setLabelColumns] = useState(3);
  const [labelRows, setLabelRows] = useState(8);
  const [labelWidth, setLabelWidth] = useState(63); // mm (A4/25.4mm margins)
  const [labelHeight, setLabelHeight] = useState(37); // mm
  const [showPrice, setShowPrice] = useState(true);
  const [showQty, setShowQty] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Build the printable HTML
  const generatePrintHTML = useCallback(() => {
    const cols = labelColumns;
    const rows = labelRows;
    const w = labelWidth;
    const h = labelHeight;
    const gap = 2; // mm gap between labels
    const pageWidth = 210; // A4 width in mm
    const pageMarginX = (pageWidth - cols * w - (cols - 1) * gap) / 2;
    const pageMarginY = 10; // mm top/bottom margin

    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Étiquettes Stocky — ${products.length} produits</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      width: 210mm;
      min-height: 297mm;
      page-break-after: avoid;
    }
    .page {
      width: 180mm;
      margin: 0 auto;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(${cols}, ${w}mm);
      grid-auto-rows: ${h}mm;
      gap: ${gap}mm;
      justify-content: center;
    }
    .label {
      border: 0.5px solid #ccc;
      border-radius: 2mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2mm;
      page-break-inside: avoid;
      overflow: hidden;
      position: relative;
    }
    .label-qr {
      width: ${Math.round(w * 0.45)}mm;
      height: ${Math.round(w * 0.45)}mm;
    }
    .label-name {
      font-size: 7pt;
      font-weight: 600;
      text-align: center;
      margin-top: 1mm;
      line-height: 1.1;
      max-height: ${Math.round(h * 0.25)}mm;
      overflow: hidden;
      word-break: break-word;
    }
    .label-sku {
      font-size: 6pt;
      font-family: monospace;
      color: #666;
      margin-top: 0.5mm;
    }
    .label-price {
      font-size: 8pt;
      font-weight: 700;
      color: #0D6EFD;
      margin-top: 0.5mm;
    }
    .label-qty {
      font-size: 6pt;
      color: #888;
    }
    .label-desc {
      font-size: 5pt;
      color: #999;
      text-align: center;
      max-height: ${Math.round(h * 0.2)}mm;
      overflow: hidden;
      margin-top: 0.5mm;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="grid">`;

    const totalCells = cols * rows;
    products.forEach((product, idx) => {
      if (idx >= totalCells) return;
      const qrData = generateQRData(product.id, product.template_id);

      // Inline SVG QR (simplified) — use a data URI approach
      html += `
      <div class="label">
        <div class="label-qr" style="display:flex;align-items:center;justify-content:center;">
          <img src="/qr-placeholder.png?d=${encodeURIComponent(qrData)}" 
               width="${Math.round(w * 0.45)}" height="${Math.round(w * 0.45)}"
               alt="QR" onerror="this.style.display='none'"/>
        </div>
        <div class="label-name">${product.name}</div>`;

      if (showDesc && product.description) {
        html += `<div class="label-desc">${product.description.slice(0, 60)}</div>`;
      }
      if (showPrice && product.base_selling_price !== null) {
        html += `<div class="label-price">${product.base_selling_price.toFixed(2)} €</div>`;
      }
      if (showQty) {
        html += `<div class="label-qty">Qté: ${product.base_quantity}</div>`;
      }

      html += `</div>`;
    });

    // Fill remaining cells with empty labels
    for (let i = products.length; i < totalCells; i++) {
      html += `<div class="label"></div>`;
    }

    html += `
    </div>
  </div>
</body>
</html>`;

    return html;
  }, [products, labelColumns, labelRows, labelWidth, labelHeight, showPrice, showQty, showDesc]);

  const handlePrint = useCallback(() => {
    const html = generatePrintHTML();
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour imprimer les étiquettes.');
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Wait for fonts/images then print
    setTimeout(() => {
      printWindow.print();
      // Don't close automatically — user might want to save as PDF
    }, 500);
  }, [generatePrintHTML]);

  const handlePreview = useCallback(() => {
    const html = generatePrintHTML();
    const previewWindow = window.open('', 'label-preview', 'width=900,height=700');
    if (previewWindow) {
      previewWindow.document.write(html);
      previewWindow.document.close();
      previewWindow.focus();
    }
  }, [generatePrintHTML]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Imprimer des étiquettes</DialogTitle>
            <DialogDescription>
              {products.length} produit{products.length !== 1 ? 's' : ''} — format A4
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Layout options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Colonnes</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={labelColumns}
                  onChange={(e) => setLabelColumns(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Lignes par page</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={labelRows}
                  onChange={(e) => setLabelRows(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Largeur (mm)</Label>
                <Input
                  type="number"
                  min={30}
                  max={100}
                  value={labelWidth}
                  onChange={(e) => setLabelWidth(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Hauteur (mm)</Label>
                <Input
                  type="number"
                  min={20}
                  max={80}
                  value={labelHeight}
                  onChange={(e) => setLabelHeight(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Display options */}
            <div className="space-y-2">
              <Label>Afficher sur les étiquettes</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                  />
                  Prix
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showQty}
                    onChange={(e) => setShowQty(e.target.checked)}
                  />
                  Quantité
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showDesc}
                    onChange={(e) => setShowDesc(e.target.checked)}
                  />
                  Description
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Aperçu
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
