'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  CheckSquare,
  Square,
  ChevronUp,
  ChevronDown,
  ChevronUpCircle,
  ChevronDownCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { exportToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { Product } from '@/types/product';
import { ExportButton } from '@/components/export/export-button';

const PAGE_SIZE = 10;

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: keyof Product;
  direction: SortDirection;
}

interface ProductListProps {
  onEdit: (product: Product) => void;
  onDetail: (product: Product) => void;
}

type SortableColumn = keyof Pick<
  Product,
  'name' | 'base_quantity' | 'base_cost_price' | 'base_selling_price' | 'alert_threshold' | 'created_at'
>;

export function ProductList({ onEdit, onDetail }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Map<string, string>>(new Map());
  const [suppliers, setSuppliers] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' })
        .range(start, end);

      // Search
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,id.ilike.%${search}%`);
      }
      // Category
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }
      // Supplier
      if (supplierFilter !== 'all') {
        query = query.eq('supplier_id', supplierFilter);
      }
      // Stock level
      if (stockFilter === 'in_stock') {
        query = query.gt('base_quantity', 'alert_threshold');
      } else if (stockFilter === 'low_stock') {
        query = query.lte('base_quantity', 'alert_threshold').gt('base_quantity', 0);
      } else if (stockFilter === 'out_of_stock') {
        query = query.eq('base_quantity', 0);
      }
      // Date range
      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_at', `${dateTo}T23:59:59`);
      }
      // Price range
      if (priceMin) {
        query = query.gte('base_selling_price', parseFloat(priceMin));
      }
      if (priceMax) {
        query = query.lte('base_selling_price', parseFloat(priceMax));
      }

      const { data, count, error } = await query;
      if (error) throw error;

      setProducts((data || []) as Product[]);
      setTotal(count || 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, supplierFilter, stockFilter, dateFrom, dateTo, priceMin, priceMax, page, sortConfig]);

  // Fetch options (categories, suppliers)
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

  useEffect(() => {
    fetchProducts();
    fetchOptions();
  }, [fetchProducts, fetchOptions]);

  // Handle select all
  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someSelected = products.some((p) => selectedIds.has(p.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle sort
  const handleSort = (key: SortableColumn) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key
          ? prev.direction === 'asc'
            ? 'desc'
            : prev.direction === 'desc'
            ? null
            : 'asc'
          : 'asc',
    }));
  };

  const getSortIcon = (key: SortableColumn) => {
    if (sortConfig.key !== key) {
      return <span className="ml-1 opacity-30">↕</span>;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="ml-1 h-3.5 w-3.5" />
    ) : sortConfig.direction === 'desc' ? (
      <ChevronDown className="ml-1 h-3.5 w-3.5" />
    ) : (
      <span className="ml-1 opacity-30">↕</span>
    );
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const supabase = createClient();
      await supabase.from('products').delete().eq('id', deleteId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setTotal((t) => t - 1);
    } catch (err: any) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteId(null);
      setConfirmDelete(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const appliedFilterCount = [
    categoryFilter !== 'all',
    supplierFilter !== 'all',
    stockFilter !== 'all',
    dateFrom,
    dateTo,
    priceMin,
    priceMax,
  ].filter(Boolean).length;

  // Export selected handler
  const handleExportSelected = () => {
    const selectedProducts = products.filter((p) => selectedIds.has(p.id));
    if (selectedProducts.length > 0) {
      const headers = [
        'Nom', 'Description', 'Quantité', 'Prix achat', 'Prix vente',
        'Seuil alerte', 'Catégorie', 'Fournisseur', 'Créé le',
      ];
      const rows = selectedProducts.map((p) => ({
        Nom: p.name,
        Description: p.description || '',
        Quantité: p.base_quantity,
        'Prix achat': p.base_cost_price || '',
        'Prix vente': p.base_selling_price || '',
        'Seuil alerte': p.alert_threshold,
        Catégorie: categories.get(p.category_id || '') || '',
        Fournisseur: suppliers.get(p.supplier_id || '') || '',
        'Créé le': formatDate(p.created_at),
      }));
      exportToCSV(rows, `produits-selectionnes`);
    }
  };

  return (
    <div>
      {/* Search + Filter Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          {/* Filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {appliedFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 text-[10px]">
                {appliedFilterCount}
              </Badge>
            )}
          </Button>

          {/* Export */}
          <ExportButton
            data={products.map((p) => ({
              Nom: p.name,
              Description: p.description || '',
              Quantité: p.base_quantity,
              'Prix achat': p.base_cost_price || '',
              'Prix vente': p.base_selling_price || '',
              'Seuil alerte': p.alert_threshold,
              Catégorie: categories.get(p.category_id || '') || '',
              Fournisseur: suppliers.get(p.supplier_id || '') || '',
              'Créé le': formatDate(p.created_at),
            }))}
            filename="produits"
            selectedCount={selectedIds.size}
            onExportSelected={handleExportSelected}
          />
        </div>

        <Badge variant="secondary" className="self-start">
          {total} produit{total !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Advanced Filters Panel */}
      {filtersOpen && (
        <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Categories */}
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Catégorie</label>
            <Select
              value={categoryFilter}
              onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {Array.from(categories.entries()).map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Suppliers */}
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Fournisseur</label>
            <Select
              value={supplierFilter}
              onValueChange={(v) => { setSupplierFilter(v); setPage(1); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous fournisseurs</SelectItem>
                {Array.from(suppliers.entries()).map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock level */}
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Niveau de stock</label>
            <Select
              value={stockFilter}
              onValueChange={(v) => { setStockFilter(v); setPage(1); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="in_stock">En stock</SelectItem>
                <SelectItem value="low_stock">Stock faible</SelectItem>
                <SelectItem value="out_of_stock">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Date début</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="h-9"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Date fin</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="h-9"
            />
          </div>

          {/* Price range */}
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Prix min</label>
            <Input
              type="number"
              value={priceMin}
              onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
              placeholder="0"
              className="h-9"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Prix max</label>
            <Input
              type="number"
              value={priceMax}
              onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
              placeholder="∞"
              className="h-9"
            />
          </div>

          {/* Reset button */}
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategoryFilter('all');
                setSupplierFilter('all');
                setStockFilter('all');
                setDateFrom('');
                setDateTo('');
                setPriceMin('');
                setPriceMax('');
                setPage(1);
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        </div>
      )}

      <Separator className="my-4" />

      {/* Selected items count */}
      {selectedIds.size > 0 && (
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckSquare className="h-4 w-4" />
          <span>{selectedIds.size} élément{selectedIds.size > 1 ? 's' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}</span>
          <Button variant="link" size="sm" onClick={() => setSelectedIds(new Set())} className="h-auto p-0 text-xs">
            Tout désélectionner
          </Button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <PackageIcon className="mb-4 h-12 w-12 opacity-30" />
          <p className="text-lg font-medium">Aucun produit trouvé</p>
          <p className="text-sm">Ajoutez votre premier produit pour commencer.</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(node) => {
                        if (node) {
                          node.indeterminate = someSelected;
                        }
                      }}
                      onChange={(e) => { e.stopPropagation(); toggleSelectAll(); }}
                      className="h-4 w-4 rounded border-border"
                      aria-label="Sélectionner tout"
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('name')}
                  >
                    Nom{getSortIcon('name')}
                  </TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-right"
                    onClick={() => handleSort('base_quantity')}
                  >
                    Quantité{getSortIcon('base_quantity')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-right"
                    onClick={() => handleSort('base_cost_price')}
                  >
                    Prix d&apos;achat{getSortIcon('base_cost_price')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-right"
                    onClick={() => handleSort('base_selling_price')}
                  >
                    Prix de vente{getSortIcon('base_selling_price')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-right"
                    onClick={() => handleSort('alert_threshold')}
                  >
                    Alerte{getSortIcon('alert_threshold')}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow
                    key={p.id}
                    className={`cursor-pointer hover:bg-accent/50 ${selectedIds.has(p.id) ? 'bg-accent/30' : ''}`}
                    onClick={() => onDetail(p)}
                  >
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      className="w-12"
                    >
                      <Checkbox
                        checked={selectedIds.has(p.id)}
                        onCheckedChange={() => toggleSelect(p.id)}
                        aria-label={`Sélectionner ${p.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{p.name}</div>
                      {p.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {p.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.category_id ? (
                        <Badge variant="outline">{categories.get(p.category_id) || '…'}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.supplier_id ? (
                        <span className="text-sm">{suppliers.get(p.supplier_id) || '…'}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={p.base_quantity <= p.alert_threshold ? 'text-destructive font-semibold' : ''}>
                        {p.base_quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {p.base_cost_price ? `${p.base_cost_price.toFixed(2)} €` : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {p.base_selling_price ? `${p.base_selling_price.toFixed(2)} €` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.base_quantity <= p.alert_threshold ? (
                        <Badge variant="destructive">{p.alert_threshold}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">{p.alert_threshold}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(p);
                          }}
                          className="h-8 px-2"
                        >
                          Éditer
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(p.id);
                            setConfirmDelete(true);
                          }}
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <p className="text-sm text-muted-foreground">
                Page {page} sur {totalPages} ({total} résultats)
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  );
}
