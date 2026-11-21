'use client';

import { useState, useCallback } from 'react';
import { Plus, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import {
  StockMovement,
  MovementType,
} from '@/types/stock-movement';
import { MovementList } from '@/components/movements/movement-list';
import { MovementDetail } from '@/components/movements/movement-detail';
import { MovementForm } from '@/components/movements/movement-form';
import { createClient } from '@/lib/supabase/client';

type View = 'list' | 'detail';

export default function MovementsPage() {
  const [view, setView] = useState<View>('list');
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null);
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());
  const [products, setProducts] = useState<Product[]>([]);

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
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau mouvement
        </Button>
      </div>

      {/* View */}
      {view === 'list' && (
        <MovementList
          onEdit={handleEdit}
          onView={handleViewDetail}
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
    </div>
  );
}
