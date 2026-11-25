'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Package, QrCode, Barcode, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { ProductForm } from '@/components/products/product-form';
import { ProductList } from '@/components/products/product-list';
import { ProductDetail } from '@/components/products/product-detail';
import { SearchBar } from '@/components/search/search-bar';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';
import { createClient } from '@/lib/supabase/client';
import { QRCodeModal } from '@/components/qr/qr-code-modal';
import { BarcodeScanner } from '@/components/barcode/barcode-scanner';
import { PrintLabels } from '@/components/qr/print-labels';

type View = 'list' | 'detail';

export default function ProductsPage() {
  const [view, setView] = useState<View>('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Map<string, string>>(new Map());
  const [suppliers, setSuppliers] = useState<Map<string, string>>(new Map());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // QR code modal for selected product
  const [qrOpen, setQROpen] = useState(false);
  // Barcode scanner
  const [scannerOpen, setScannerOpen] = useState(false);
  // Print labels
  const [printLabelsOpen, setPrintLabelsOpen] = useState(false);

  // Keyboard shortcuts: Ctrl+K to focus search
  useKeyboardShortcuts({
    onSearchFocus: () => {
      searchInputRef.current?.focus();
    },
  });

  const fetchOptions = useCallback(async () => {
    const supabase = createClient();
    const [{ data: cats }, { data: supp }] = await Promise.all([
      supabase.from('categories').select('id, name'),
      supabase.from('suppliers').select('id, name'),
    ]);
    const catMap = new Map<string, string>();
    const suppMap = new Map<string, string>();
    (cats || []).forEach((c: any) => catMap.set(c.id, c.name));
    (supp || []).forEach((s: any) => suppMap.set(s.id, s.name));
    setCategories(catMap);
    setSuppliers(suppMap);
  }, []);

  // Initial load
  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  const handleNew = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDetail = (product: Product) => {
    setSelectedProduct(product);
    setView('detail');
  };

  const handleSave = async () => {
    await fetchOptions();
    // Force re-render by toggling view briefly
    setView('list');
  };

  const handleBack = () => {
    setView('list');
    setSelectedProduct(null);
  };

  const handleScanResult = useCallback((result: string) => {
    // Try to find a product by QR data or scan result
    console.log('Barcode scanned:', result);
    // Could add logic here to find matching product by SKU
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produits</h1>
            <p className="text-muted-foreground">
              Gérez votre catalogue de produits
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPrintLabelsOpen(true)}>
            <Printer className="mr-2 h-4 w-4" />
            Étiquettes
          </Button>
          <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
            <Barcode className="mr-2 h-4 w-4" />
            Scanner
          </Button>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div ref={searchInputRef}>
        <SearchBar
          entity="products"
          fields={['name', 'description', 'id']}
          placeholder="Rechercher un produit (Ctrl+K)..."
        />
      </div>

      {view === 'list' && (
        <ProductList
          onEdit={handleEdit}
          onDetail={handleDetail}
        />
      )}

      {view === 'detail' && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          categories={categories}
          suppliers={suppliers}
          onEdit={handleEdit}
          onBack={handleBack}
        />
      )}

      {/* Create/Edit Dialog */}
      <ProductForm
        product={editingProduct}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        product={selectedProduct || editingProduct || { id: '', name: '', description: '', base_quantity: 0, alert_threshold: 5 } as Product}
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

      {/* Print Labels */}
      <PrintLabels
        products={[]}
        open={printLabelsOpen}
        onOpenChange={setPrintLabelsOpen}
      />
    </div>
  );
}
