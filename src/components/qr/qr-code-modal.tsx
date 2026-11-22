'use client';

import { useState, useCallback, useRef } from 'react';
import { X, Download, Printer, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/types/product';
import { QRCode, downloadQRCode } from './qr-code';
import { generateQRData } from '@/lib/products';

interface QRCodeModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeModal({ product, open, onOpenChange }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(200);
  const [label, setLabel] = useState('');

  // Generate QR data
  const qrData = generateQRData(product.id, product.template_id, product.name);

  const handleDownloadPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      downloadQRCode(canvas, `${product.name || 'produit'}-qrcode.png`);
    }
  }, [product.name]);

  const handlePrint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>QR Code - ${product.name}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;">
          <h2 style="font-family:system-ui;margin-bottom:0.5rem;">${product.name}</h2>
          ${product.base_quantity !== null ? `<p style="margin:0.25rem 0;color:#666;">Quantité: ${product.base_quantity}</p>` : ''}
          ${product.base_selling_price !== null ? `<p style="margin:0.25rem 0;color:#666;">Prix: ${product.base_selling_price.toFixed(2)} €</p>` : ''}
          <img src="${dataUrl}" style="width:200px;height:200px;" />
          ${product.description ? `<p style="margin-top:1rem;max-width:300px;text-align:center;color:#666;font-size:0.875rem;">${product.description}</p>` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, [product]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/produits/${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Produit: ${product.name}${product.base_quantity !== null ? `\nQuantité: ${product.base_quantity}` : ''}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: copy URL
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard not available
      }
    }
  }, [product]);

  const handleCopyLink = useCallback(() => {
    const shareUrl = `${window.location.origin}/produits/${product.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [product]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code — {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product info */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-muted-foreground">{product.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                {product.base_quantity !== null && (
                  <Badge variant="outline">Qté: {product.base_quantity}</Badge>
                )}
                {product.base_selling_price !== null && (
                  <Badge variant="outline">{product.base_selling_price.toFixed(2)} €</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* QR Code */}
          <div className="flex justify-center">
            <QRCode
              data={qrData}
              size={qrSize}
              includeLabel={true}
              label={product.name}
              printMode={false}
            />
          </div>

          {/* Size slider */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Taille: {qrSize}×{qrSize}px</label>
            <input
              type="range"
              min={100}
              max={400}
              step={50}
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <Separator />

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
              <Download className="mr-2 h-4 w-4" />
              PNG
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? 'Copié !' : 'Copier'}
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Bulk QR generation for multiple products — generates a printable sheet.
 */
interface BulkQROptions {
  products: Product[];
}

export function useBulkQR() {
  const generateSheet = useCallback(
    (products: Product[], productsPerPage: number = 21) => {
      // Returns data for rendering a label sheet
      return products;
    },
    []
  );

  return { generateSheet };
}
