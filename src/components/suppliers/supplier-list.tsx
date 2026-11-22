'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Globe,
  Edit,
  Trash2,
  MapPin,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { type Supplier } from '@/types/supplier';
import { getSupplierAvatar } from '@/types/supplier';

const PAGE_SIZE = 10;

export function SupplierList({
  onEdit,
  onDetail,
}: {
  onEdit: (supplier: Supplier) => void;
  onDetail: (supplier: Supplier) => void;
}) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'products_count'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      let query = supabase
        .from('suppliers')
        .select('*', { count: 'exact' })
        .order(sortKey, { ascending: sortDir === 'asc' })
        .range(start, end);

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      // Fetch product counts for each supplier
      const supplierData = (data || []) as Supplier[];
      if (supplierData.length > 0) {
        const ids = supplierData.map((s) => s.id);
        const { data: counts } = await supabase
          .from('products')
          .select('supplier_id, id')
          .in('supplier_id', ids);
        const countMap: Record<string, number> = {};
        (counts || []).forEach((p: any) => {
          countMap[p.supplier_id] = (countMap[p.supplier_id] || 0) + 1;
        });
        setSuppliers(
          supplierData.map((s) => ({
            ...s,
            // @ts-ignore - we extend with products_count dynamically
            products_count: countMap[s.id] || 0,
          }))
        );
      } else {
        setSuppliers([]);
      }
      setTotal(count || 0);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page, sortKey, sortDir]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const supabase = createClient();
      await supabase.from('suppliers').delete().eq('id', deleteId);
      setSuppliers((prev) => prev.filter((s) => s.id !== deleteId));
      setTotal((t) => t - 1);
    } catch (err: any) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteId(null);
      setConfirmDelete(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('');
  };

  return (
    <div>
      {/* Search + Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un fournisseur..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary">
          {total} fournisseur{total !== 1 ? 's' : ''}
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Aucun fournisseur trouvé</p>
          <p className="text-sm">Ajoutez votre premier fournisseur pour commencer.</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => {
                      if (sortKey === 'name') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      else { setSortKey('name'); setSortDir('asc'); }
                    }}
                  >
                    Nom
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => {
                      if (sortKey === 'products_count') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      else { setSortKey('products_count'); setSortDir('asc'); }
                    }}
                  >
                    Produits
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => {
                  const count = (s as any).products_count || 0;
                  return (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => onDetail(s)}
                    >
                      <TableCell>
                        <img
                          src={getSupplierAvatar(getInitials(s.name))}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.contact_person || <span className="text-muted-foreground text-sm">—</span>}</TableCell>
                      <TableCell>
                        {s.email ? (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {s.email}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {s.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {s.phone}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{count} produit{count !== 1 ? 's' : ''}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(s)}
                            className="h-8 px-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setDeleteId(s.id); setConfirmDelete(true); }}
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
            Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.
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
