'use client';

import { ArrowLeft, QrCode, Barcode, Printer } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QRCode } from '@/components/qr/qr-code';
import { QRCodeModal } from '@/components/qr/qr-code-modal';
import { BarcodeScanner } from '@/components/barcode/barcode-scanner';
import { generateQRData } from '@/lib/products';
import { useState, useCallback } from 'react';

interface ProductDetailProps {
  product: Product;
  categories: Map<string, string>;
  suppliers: Map<string, string>;
  onEdit: (product: Product) => void;
  onBack: () => void;
}

export function ProductDetail({ product, categories, suppliers, onEdit, onBack }: ProductDetailProps) {
  const lowStock = product.base_quantity <= product.alert_threshold;
  const stockValue = (product.base_quantity || 0) * (product.base_cost_price || 0);

  // QR modal state
  const [qrOpen, setQROpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Action buttons row for QR/scan
  const handleScanResult = useCallback((result: string) => {
    // Could navigate to the scanned product or record a movement
    console.log('Scanned:', result);
  }, []);

  const qrData = generateQRData(product.id, product.template_id, product.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex-1" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
            <Barcode className="mr-2 h-4 w-4" />
            Scanner
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQROpen(true)}>
            <QrCode className="mr-2 h-4 w-4" />
            QR Code
          </Button>
          <Button onClick={() => onEdit(product)}>
            Éditer le produit
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.description && (
              <p className="mt-2 text-muted-foreground">{product.description}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Catégorie</p>
              <p className="mt-1 font-medium">
                {product.category_id
                  ? categories.get(product.category_id) || '—'
                  : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Fournisseur</p>
              <p className="mt-1 font-medium">
                {product.supplier_id
                  ? suppliers.get(product.supplier_id) || '—'
                  : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Quantité en stock</p>
              <p className={`mt-1 text-2xl font-bold font-mono ${lowStock ? 'text-destructive' : ''}`}>
                {product.base_quantity}
              </p>
              {lowStock && (
                <Badge variant="destructive" className="mt-2">
                  Stock insuffisant
                </Badge>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Seuil d&apos;alerte</p>
              <p className="mt-1 text-2xl font-bold font-mono">{product.alert_threshold}</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Prix d&apos;achat unitaire</p>
              <p className="mt-1 text-2xl font-bold font-mono">
                {product.base_cost_price ? `${product.base_cost_price.toFixed(2)} €` : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Prix de vente unitaire</p>
              <p className="mt-1 text-2xl font-bold font-mono">
                {product.base_selling_price ? `${product.base_selling_price.toFixed(2)} €` : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4 md:col-span-2">
              <p className="text-sm text-muted-foreground">Valeur du stock</p>
              <p className="mt-1 text-2xl font-bold font-mono text-primary">
                {stockValue.toFixed(2)} €
              </p>
            </div>
          </div>

          {product.photo_url && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Image du produit</p>
              <img
                src={product.photo_url}
                alt={product.name}
                className="max-h-64 rounded-lg border object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Meta sidebar */}
        <div className="space-y-4">
          {/* Mini QR code preview */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              QR Code
            </h3>
            <div className="flex justify-center">
              <QRCode data={qrData} size={150} includeLabel={true} label={product.name} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setQROpen(true)}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Ouvrir le QR Code complet
            </Button>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Informations
            </h3>
            <div>
              <p className="text-xs text-muted-foreground">Créé le</p>
              <p className="text-sm font-medium">{formatDate(product.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Modifié le</p>
              <p className="text-sm font-medium">{formatDate(product.updated_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ID</p>
              <p className="text-xs font-mono text-muted-foreground break-all">{product.id}</p>
            </div>
          </div>

          {Object.keys(product.custom_fields || {}).length > 0 && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Champs personnalisés
              </h3>
              {Object.entries(product.custom_fields).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                  <p className="text-sm font-medium">{String(value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        product={product}
        open={qrOpen}
        onOpenChange={setQROpen}
      />

      {/* Barcode Scanner */}
      <BarcodeScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleScanResult}
        facingMode="environment"
      />
    </div>
  );
}
