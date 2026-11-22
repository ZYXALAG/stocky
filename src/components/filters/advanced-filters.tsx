'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Tag,
  ShoppingBag,
  Calendar,
  TrendingDown,
  TrendingUp,
  Activity,
  Warehouse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

export type FilterEntityType = 'products' | 'movements';

export interface FilterState {
  categories: string[];
  suppliers: string[];
  dateFrom: string;
  dateTo: string;
  priceMin: string;
  priceMax: string;
  stockLevel: string;
  movementType: string;
  searchProduct: string;
}

interface AdvancedFiltersProps {
  entityType: FilterEntityType;
  isOpen: boolean;
  onToggle: () => void;
  onApply: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  defaultFilters?: Partial<FilterState>;
  appliedFilterCount: number;
}

export function AdvancedFilters({
  entityType,
  isOpen,
  onToggle,
  onApply,
  onReset,
  defaultFilters = {},
  appliedFilterCount,
}: AdvancedFiltersProps) {
  const [categories, setCategories] = useState<Map<string, string>>(new Map());
  const [suppliers, setSuppliers] = useState<Map<string, string>>(new Map());
  const [localFilters, setLocalFilters] = useState<Partial<FilterState>>({
    categories: [],
    suppliers: [],
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: '',
    stockLevel: '',
    movementType: '',
    searchProduct: '',
    ...defaultFilters,
  });

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(localFilters.categories || [])
  );
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(
    new Set(localFilters.suppliers || [])
  );

  const fetchOptions = useCallback(async () => {
    const supabase = createClient();
    try {
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
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // Reset local filters when defaultFilters changes
  useEffect(() => {
    setSelectedCategories(new Set(defaultFilters.categories || []));
    setSelectedSuppliers(new Set(defaultFilters.suppliers || []));
    setLocalFilters({
      categories: [],
      suppliers: [],
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: '',
      stockLevel: '',
      movementType: '',
      searchProduct: '',
      ...defaultFilters,
    });
  }, [defaultFilters]);

  const toggleCategory = useCallback((catId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }, []);

  const toggleSupplier = useCallback((supId: string) => {
    setSelectedSuppliers((prev) => {
      const next = new Set(prev);
      if (next.has(supId)) next.delete(supId);
      else next.add(supId);
      return next;
    });
  }, []);

  const handleApply = () => {
    const filters: Partial<FilterState> = {
      ...localFilters,
      categories: Array.from(selectedCategories),
      suppliers: Array.from(selectedSuppliers),
    };
    onApply(filters);
  };

  const handleReset = () => {
    setLocalFilters({
      categories: [],
      suppliers: [],
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: '',
      stockLevel: '',
      movementType: '',
      searchProduct: '',
    });
    setSelectedCategories(new Set());
    setSelectedSuppliers(new Set());
    onReset();
  };

  const activeCount =
    (selectedCategories.size > 0 ? 1 : 0) +
    (selectedSuppliers.size > 0 ? 1 : 0) +
    (localFilters.dateFrom ? 1 : 0) +
    (localFilters.dateTo ? 1 : 0) +
    (localFilters.priceMin ? 1 : 0) +
    (localFilters.priceMax ? 1 : 0) +
    (localFilters.stockLevel ? 1 : 0) +
    (localFilters.movementType && localFilters.movementType !== 'all' ? 1 : 0) +
    (localFilters.searchProduct ? 1 : 0);

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-medium"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filtres avancés</span>
          {appliedFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {appliedFilterCount}
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Categories */}
          {(entityType === 'products') && (
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                Catégories
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(categories.entries()).map(([id, name]) => (
                  <Badge
                    key={id}
                    variant={selectedCategories.has(id) ? 'default' : 'outline'}
                    className="cursor-pointer gap-1 px-2 py-0.5 text-xs hover:bg-accent"
                    onClick={() => toggleCategory(id)}
                  >
                    {selectedCategories.has(id) && <Check className="h-3 w-3" />}
                    {name}
                  </Badge>
                ))}
                {categories.size === 0 && (
                  <span className="text-xs text-muted-foreground">Aucune catégorie</span>
                )}
              </div>
            </div>
          )}

          {/* Suppliers */}
          {entityType === 'products' && (
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <ShoppingBag className="h-3.5 w-3.5" />
                Fournisseurs
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(suppliers.entries()).map(([id, name]) => (
                  <Badge
                    key={id}
                    variant={selectedSuppliers.has(id) ? 'default' : 'outline'}
                    className="cursor-pointer gap-1 px-2 py-0.5 text-xs hover:bg-accent"
                    onClick={() => toggleSupplier(id)}
                  >
                    {selectedSuppliers.has(id) && <Check className="h-3 w-3" />}
                    {name}
                  </Badge>
                ))}
                {suppliers.size === 0 && (
                  <span className="text-xs text-muted-foreground">Aucun fournisseur</span>
                )}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Période
            </label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={localFilters.dateFrom}
                onChange={(e) =>
                  setLocalFilters((f) => ({ ...f, dateFrom: e.target.value }))
                }
                placeholder="Du"
                className="h-9"
              />
              <Input
                type="date"
                value={localFilters.dateTo}
                onChange={(e) =>
                  setLocalFilters((f) => ({ ...f, dateTo: e.target.value }))
                }
                placeholder="Au"
                className="h-9"
              />
            </div>
          </div>

          {/* Price Range — products only */}
          {entityType === 'products' && (
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <TrendingDown className="h-3.5 w-3.5" />
                Fourchette de prix
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={localFilters.priceMin}
                  onChange={(e) =>
                    setLocalFilters((f) => ({ ...f, priceMin: e.target.value }))
                  }
                  placeholder="Min"
                  className="h-9"
                />
                <Input
                  type="number"
                  value={localFilters.priceMax}
                  onChange={(e) =>
                    setLocalFilters((f) => ({ ...f, priceMax: e.target.value }))
                  }
                  placeholder="Max"
                  className="h-9"
                />
              </div>
            </div>
          )}

          {/* Stock Level — products only */}
          {entityType === 'products' && (
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                Niveau de stock
              </label>
              <div className="flex gap-2">
                <Badge
                  variant={localFilters.stockLevel === 'in_stock' ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1 text-xs hover:bg-accent"
                  onClick={() =>
                    setLocalFilters((f) => ({
                      ...f,
                      stockLevel: f.stockLevel === 'in_stock' ? '' : 'in_stock',
                    }))
                  }
                >
                  <Check className="mr-1 h-3 w-3" />
                  En stock
                </Badge>
                <Badge
                  variant={localFilters.stockLevel === 'low_stock' ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1 text-xs hover:bg-accent"
                  onClick={() =>
                    setLocalFilters((f) => ({
                      ...f,
                      stockLevel: f.stockLevel === 'low_stock' ? '' : 'low_stock',
                    }))
                  }
                >
                  <Check className="mr-1 h-3 w-3" />
                  Stock faible
                </Badge>
                <Badge
                  variant={localFilters.stockLevel === 'out_of_stock' ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1 text-xs hover:bg-accent"
                  onClick={() =>
                    setLocalFilters((f) => ({
                      ...f,
                      stockLevel: f.stockLevel === 'out_of_stock' ? '' : 'out_of_stock',
                    }))
                  }
                >
                  <Check className="mr-1 h-3 w-3" />
                  Rupture
                </Badge>
              </div>
            </div>
          )}

          {/* Movement Type — movements only */}
          {entityType === 'movements' && (
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Warehouse className="h-3.5 w-3.5" />
                Type de mouvement
              </label>
              <div className="flex gap-2">
                {['in', 'out', 'adjustment', 'transfer'].map((type) => (
                  <Badge
                    key={type}
                    variant={
                      localFilters.movementType === type ? 'default' : 'outline'
                    }
                    className="cursor-pointer px-3 py-1 text-xs hover:bg-accent"
                    onClick={() =>
                      setLocalFilters((f) => ({
                        ...f,
                        movementType: f.movementType === type ? '' : type,
                      }))
                    }
                  >
                    <Check className="mr-1 h-3 w-3" />
                    {type === 'in'
                      ? 'Entrée'
                      : type === 'out'
                      ? 'Sortie'
                      : type === 'adjustment'
                      ? 'Ajustement'
                      : 'Transfert'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
                <X className="h-3.5 w-3.5" />
                Réinitialiser
              </Button>
            )}
            <Button size="sm" onClick={handleApply}>
              Appliquer les filtres
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
