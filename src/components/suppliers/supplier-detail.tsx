'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  Trash2,
  Package,
  ArrowRightLeft,
  ArrowLeft,
  Plus,
  Building2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatDateRelative } from '@/lib/utils';
import { type Supplier } from '@/types/supplier';
import { getSupplierAvatar } from '@/types/supplier';
import { toast } from '@/hooks/use-toast';

interface SupplierDetailProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function SupplierDetail({ supplier, onEdit, onBack }: SupplierDetailProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const [{ data: prods }, { data: moves }] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('supplier_id', supplier.id)
          .order('name'),
        supabase
          .from('stock_movements')
          .select('*, products(name)')
          .eq('supplier_id', supplier.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);
      setProducts(prods || []);
      setMovements(moves || []);
    } catch (err) {
      console.error('Failed to fetch supplier details:', err);
    } finally {
      setLoading(false);
    }
  }, [supplier.id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const initials = supplier.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
      </div>

      {/* Profile */}
      <div className="flex flex-col sm:flex-row gap-4">
        <img
          src={getSupplierAvatar(initials)}
          alt={supplier.name}
          className="h-16 w-16 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{supplier.name}</h2>
            <Badge variant="secondary">Fournisseur</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Ajouté le {formatDate(supplier.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(supplier)}>
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-lg border border-border p-4">
        {supplier.contact_person && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Contact</p>
              <p className="font-medium">{supplier.contact_person}</p>
            </div>
          </div>
        )}
        {supplier.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{supplier.email}</p>
            </div>
          </div>
        )}
        {supplier.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Téléphone</p>
              <p className="font-medium">{supplier.phone}</p>
            </div>
          </div>
        )}
        {supplier.website && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Site web</p>
              <p className="font-medium">
                <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {supplier.website.replace(/^https?:\/\//, '')}
                </a>
              </p>
            </div>
          </div>
        )}
        {supplier.address && (
          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Adresse</p>
              <p className="font-medium">
                {supplier.address}
                {supplier.postal_code && ` ${supplier.postal_code}`}
                {supplier.city && `, ${supplier.city}`}
                {supplier.country && ` (${supplier.country})`}
              </p>
            </div>
          </div>
        )}
        {supplier.notes && (
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{supplier.notes}</p>
          </div>
        )}
      </div>

      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            Produits ({products.length})
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Aucun produit de ce fournisseur.</p>
        ) : (
          <div className="rounded-md border">
            <div className="divide-y divide-border">
              {products.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {p.base_quantity} · Seuils: {p.alert_threshold}
                    </p>
                  </div>
                  <Badge variant="secondary" className={p.base_quantity <= p.alert_threshold ? 'text-destructive' : ''}>
                    {p.base_quantity} en stock
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Movements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
            Mouvements récents
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          </div>
        ) : movements.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Aucun mouvement récent.</p>
        ) : (
          <div className="rounded-md border">
            <div className="divide-y divide-border">
              {movements.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">
                      {m.movement_type === 'in' ? 'Entrée' : m.movement_type === 'out' ? 'Sortie' : m.movement_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.products?.name || 'Produit'} · {formatDateRelative(m.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={m.movement_type === 'in' ? 'default' : 'destructive'}
                    className={m.movement_type === 'in' ? 'bg-emerald-500' : ''}
                  >
                    {m.movement_type === 'in' ? '+' : '-'}{m.quantity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
