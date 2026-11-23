'use client';

import { useState, useCallback, useRef } from 'react';
import { Plus, ArrowUpRight, Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import {
  StockMovement,
  MovementType,
  formatMovementType,
} from '@/types/stock-movement';
import { MovementList } from '@/components/movements/movement-list';
import { MovementDetail } from '@/components/movements/movement-detail';
import { MovementForm } from '@/components/movements/movement-form';
import { SearchBar } from '@/components/search/search-bar';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/components/barcode/barcode-scanner';
import { parseQRData } from '@/lib/products';

type View = 'list' | 'detail';

const movementTypeLabels: Record<MovementType, string> = {
  in: 'Entrée',
  out: 'Sortie',
  adjustment: 'Ajustement',
  transfer: 'Transfert',
};

export default function MovementsPage() {
  const [view, setView] = useState<View>('list');
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null);
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());
  const [products, setProducts] = useState<Product[]>([]);
  const [typeFilter, setTypeFilter] = useState<MovementType | 'all'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Barcode scanner
  const [scannerOpen, setScannerOpen] = useState(false);

  // Keyboard shortcuts: Ctrl+K to focus search
  useKeyboardShortcuts({
    onSearchFocus: () => {
      searchInputRef.current?.focus();
    },
  });

  const fetchProducts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select('id, name, description, photo_url, category_id, supplier_id, base_quantity, base_cost_price, base_selling_price, alert_threshold, custom_fields, created_at, updated_at');

    const prodList = (data || []) as Product[];
    setProducts(prodList);

    const map = new Map<string, Product>();
    prodList.forEach((p: Product) => map.set(p.id, p));
    setProductsMap(map);
  }, []);

  useState(() => { fetchProducts(); });

  const handleNew = () => {
    setEditingMovement(null);
    setFormOpen(true);
  };

  const handleEdit = (movement: StockMovement) => {
    setEditingMovement(movement);
    setFormOpen(true);
  };

  const handleViewDetail = async (movement: StockMovement) => {
    setSelectedMovement(movement);
    // Fetch the product if not already in map
    if (movement.product_id && !productsMap.has(movement.product_id)) {
      const supabase = createClient();
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('id', movement.product_id)
        .single();
      if (prodData) {
        const prod = prodData as Product;
        const newMap = new Map(productsMap);
        newMap.set(prod.id, prod);
        setProductsMap(newMap);
        setSelectedProduct(prod);
      }
    } else {
      setSelectedProduct(productsMap.get(movement.product_id!) || null);
    }
    setView('detail');
  };

  const handleSave = () => {
    // Force refresh
    setView('list');
    setSelectedMovement(null);
    setEditingMovement(null);
  };

  const handleBack = () => {
    setView('list');
    setSelectedMovement(null);
    setSelectedProduct(null);
  };

  const handleScanResult = useCallback((result: string) => {
    // Parse QR data to find product
    const qrData = parseQRData(result);
    if (qrData && qrData.productId) {
      // Check if product is in map
      let product = productsMap.get(qrData.productId);
      if (!product) {
        // Fetch from Supabase
        (async () => {
          const supabase = createClient();
          const { data: prodData } = await supabase
            .from('products')
            .select('*')
            .eq('id', qrData.productId)
            .single();
          if (prodData) {
            const prod = prodData as Product;
            const newMap = new Map(productsMap);
            newMap.set(prod.id, prod);
            setProductsMap(newMap);
            setProducts((prev) => [...prev, prod]);
            // Navigate to product detail / create movement
            setSelectedProduct(prod);
            toast({
              title: 'Produit trouvé',
              description: `${prod.name} (Qté: ${prod.base_quantity})`,
            });
          }
        })();
      } else {
        setSelectedProduct(product);
        toast({
          title: 'Produit trouvé',
          description: `${product.name} (Qté: ${product.base_quantity})`,
        });
      }
    } else {
      toast({
        title: 'Code détecté',
        description: `Résultat: ${result.slice(0, 50)}`,
      });
    }
  }, [productsMap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mouvements</h1>
            <p className="text-muted-foreground">
              Suivez les entrées, sorties, ajustements et transferts de stock
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
            <Barcode className="mr-2 h-4 w-4" />
            Scanner
          </Button>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau mouvement
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div ref={searchInputRef}>
        <SearchBar
          entity="movements"
          fields={['reference', 'notes', 'id']}
          placeholder="Rechercher un mouvement (Ctrl+K)..."
        />
      </div>

      {/* Movement type filter chips */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={typeFilter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1 text-sm"
          onClick={() => setTypeFilter('all')}
        >
          Tous
        </Badge>
        {Object.entries(movementTypeLabels).map(([key, label]) => (
          <Badge
            key={key}
            variant={typeFilter === key ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1 text-sm"
            onClick={() => setTypeFilter(key as MovementType)}
          >
            {label}
          </Badge>
        ))}
      </div>

      {/* View */}
      {view === 'list' && (
        <MovementList
          onEdit={handleEdit}
          onView={handleViewDetail}
          typeFilter={typeFilter}
        />
      )}

      {view === 'detail' && selectedMovement && (
        <MovementDetail
          movement={selectedMovement}
          product={selectedProduct}
          onEdit={handleEdit}
          onBack={handleBack}
          onDelete={handleSave}
        />
      )}

      {/* Create/Edit Dialog */}
      <MovementForm
        movement={editingMovement}
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) setEditingMovement(null);
          setFormOpen(open);
        }}
        onSave={handleSave}
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
