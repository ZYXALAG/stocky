'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  StockMovement,
  MovementType,
  formatMovementType,
  getMovementColor,
} from '@/types/stock-movement';
import { toast } from '@/hooks/use-toast';
import { ExportButton } from '@/components/export/export-button';

const PAGE_SIZE = 15;

interface MovementListProps {
  onEdit: (movement: StockMovement) => void;
  onView: (movement: StockMovement) => void;
  typeFilter?: MovementType | 'all';
}

export function MovementList({ onEdit, onView, typeFilter: typeFilterProp }: MovementListProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementType | 'all'>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Export data for ExportButton
  const exportData = useMemo(() => {
    const typeLabel = (t: MovementType) =>
      t === 'in' ? 'Entrée' : t === 'out' ? 'Sortie' : t === 'adjustment' ? 'Ajustement' : 'Transfert';
    return movements.map((m) => ({
      'ID': m.id,
      'Type': typeLabel(m.movement_type),
      'Quantité': m.quantity,
      'Produit': products.get(m.product_id || '') || '—',
      'Lieu départ': m.location_from || '—',
      'Lieu arrivée': m.location_to || '—',
      'Référence': m.reference || '—',
      'Notes': m.notes || '',
      'Date': formatDate(m.created_at),
    }));
  }, [movements, products]);

  // Effective type filter: prop takes precedence over internal state
  const effectiveTypeFilter = typeFilterProp ?? typeFilter;

  // Sync internal state when page provides a filter
  useEffect(() => {
    if (typeFilterProp !== undefined) {
      setTypeFilter(typeFilterProp);
    }
  }, [typeFilterProp]);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      let query = supabase
        .from('stock_movements')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (effectiveTypeFilter !== 'all') {
        query = query.eq('movement_type', effectiveTypeFilter);
      }
      if (productFilter !== 'all') {
        query = query.eq('product_id', productFilter);
      }
      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        const endOfDay = `${dateTo}T23:59:59`;
        query = query.lte('created_at', endOfDay);
      }
      if (search) {
        query = query.or(`reference.ilike.%${search}%,notes.ilike.%${search}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      setMovements((data || []) as StockMovement[]);
      setTotal(count || 0);
    } catch (err) {
      console.error('Failed to fetch movements:', err);
    } finally {
      setLoading(false);
    }
  }, [effectiveTypeFilter, productFilter, dateFrom, dateTo, search, page]);

  const fetchProducts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('products').select('id, name');
    const map = new Map<string, string>();
    (data || []).forEach((p: any) => map.set(p.id, p.name));
    setProducts(map);
  }, []);

  useEffect(() => {
    fetchMovements();
    fetchProducts();
  }, [fetchMovements, fetchProducts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const supabase = createClient();
      await supabase.from('stock_movements').delete().eq('id', deleteId);
      setMovements((prev) => prev.filter((m) => m.id !== deleteId));
      setTotal((t) => t - 1);
      toast({ title: 'Mouvement supprimé' });
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast({ title: 'Erreur', description: err.message ?? 'Suppression échouée.' });
    } finally {
      setDeleteId(null);
      setConfirmDelete(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const activeFilterCount = [
    effectiveTypeFilter !== 'all',
    productFilter !== 'all',
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  // Movement type options
  const movementTypeOptions: { value: MovementType | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'in', label: 'Entrée' },
    { value: 'out', label: 'Sortie' },
    { value: 'adjustment', label: 'Ajustement' },
    { value: 'transfer', label: 'Transfert' },
  ];

  // Count product names matching search
  const searchProductMatch = (name: string) => {
    if (!search) return true;
    return name.toLowerCase().includes(search.toLowerCase());
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher (référence, notes)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          {/* Movement type chips */}
          <div className="flex gap-1.5">
            {movementTypeOptions.map((opt) => (
              <Badge
                key={opt.value}
                variant={typeFilter === opt.value ? 'default' : 'outline'}
                className="cursor-pointer px-2.5 py-0.5 text-xs hover:bg-accent"
                onClick={() => { setTypeFilter(opt.value as MovementType | 'all'); setPage(1); }}
              >
                {opt.label}
              </Badge>
            ))}
          </div>

          {/* Advanced filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Export button */}
          <ExportButton data={exportData} filename="mouvements" />
        </div>

        <Badge variant="secondary" className="self-start">
          {total} mouvement{total !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Advanced Filters Panel */}
      {filtersOpen && (
        <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Product filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Produit</label>
            <Select
              value={productFilter}
              onValueChange={(v) => { setProductFilter(v); setPage(1); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous produits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous produits</SelectItem>
                {Array.from(products.entries())
                  .filter(([id, name]) => searchProductMatch(name))
                  .map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
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

          {/* Reset button */}
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setProductFilter('all');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      )}

      <Separator className="my-4" />

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : movements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <svg
            className="mb-4 h-12 w-12 opacity-30"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <p className="text-lg font-medium">Aucun mouvement trouvé</p>
          <p className="text-sm">Enregistrez votre premier mouvement de stock.</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead>Lieux</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => {
                  const productName = products.get(m.product_id || '') || '—';
                  const locationText =
                    m.movement_type === 'transfer'
                      ? `${m.location_from || '—'} → ${m.location_to || '—'}`
                      : m.location_from || '—';

                  return (
                    <TableRow
                      key={m.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => onView(m)}
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getMovementColor(m.movement_type)}
                        >
                          {m.movement_type === 'in' ? (
                            <ArrowUp className="mr-1 h-3 w-3" />
                          ) : m.movement_type === 'out' ? (
                            <ArrowDown className="mr-1 h-3 w-3" />
                          ) : null}
                          {formatMovementType(m.movement_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{productName}</TableCell>
                      <TableCell className="text-right font-mono">
                        <span
                          className={
                            m.movement_type === 'in'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : m.movement_type === 'out'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-muted-foreground'
                          }
                        >
                          {m.movement_type === 'in' ? '+' : m.movement_type === 'out' ? '–' : '±'}
                          {m.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">
                        {locationText}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.reference || '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatDate(m.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(m);
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
                              setDeleteId(m.id);
                              setConfirmDelete(true);
                            }}
                            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
            Êtes-vous sûr de vouloir supprimer ce mouvement ? Cette action est irréversible.
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
