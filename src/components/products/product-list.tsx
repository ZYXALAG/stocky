'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
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

const PAGE_SIZE = 10;

interface ProductListProps {
  onEdit: (product: Product) => void;
  onDetail: (product: Product) => void;
}

export function ProductList({ onEdit, onDetail }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Map<string, string>>(new Map());
  const [suppliers, setSuppliers] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch products with category/supplier names
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
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
  }, [search, categoryFilter, page]);

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

  return (
    <div>
      {/* Search + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
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

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {Array.from(categories.entries()).map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Badge variant="secondary" className="self-start">
          {total} produit{total !== 1 ? 's' : ''}
        </Badge>
      </div>

      <Separator className="my-4" />

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
                  <TableHead className="w-[300px]">Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix d&apos;achat</TableHead>
                  <TableHead className="text-right">Prix de vente</TableHead>
                  <TableHead className="text-right">Alerte</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => onDetail(p)}
                  >
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
