'use client';

import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { Product } from '@/types/product';
import {
  StockMovement,
  formatMovementType,
  getMovementColor,
  type MovementType,
} from '@/types/stock-movement';
import { toast } from '@/hooks/use-toast';

interface MovementDetailProps {
  movement: StockMovement;
  product: Product | null;
  onEdit: (movement: StockMovement) => void;
  onBack: () => void;
  onDelete: () => void;
}

export function MovementDetail({
  movement,
  product,
  onEdit,
  onBack,
  onDelete,
}: MovementDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    try {
      const supabase = createClient();
      await supabase.from('stock_movements').delete().eq('id', movement.id);
      toast({ title: 'Mouvement supprimé' });
      onDelete();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message ?? 'Suppression échouée.' });
    }
  };

  const productName = product?.name || '—';
  const productPhoto = product?.photo_url;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => onEdit(movement)}>
          <Pencil className="mr-2 h-4 w-4" />
          Éditer
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </Button>
      </div>

      <Separator />

      {/* Info Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Product + Type */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              {productPhoto && (
                <img
                  src={productPhoto}
                  alt={productName}
                  className="h-12 w-12 rounded-lg border object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{productName}</h1>
                {product?.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Type + Quantity Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Type de mouvement</p>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className={getMovementColor(movement.movement_type)}
                >
                  {formatMovementType(movement.movement_type)}
                </Badge>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Quantité</p>
              <p
                className={`mt-1 text-2xl font-bold font-mono ${
                  movement.movement_type === 'in'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : movement.movement_type === 'out'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {movement.movement_type === 'in' ? '+' : movement.movement_type === 'out' ? '–' : '±'}
                {movement.quantity}
              </p>
            </div>

            {/* Reference */}
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Référence</p>
              <p className="mt-1 font-mono text-sm">
                {movement.reference || '—'}
              </p>
            </div>

            {/* Locations */}
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Lieux</p>
              <p className="mt-1 text-sm">
                {movement.movement_type === 'transfer' ? (
                  <span>
                    <span className="font-medium">{movement.location_from || '—'}</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="font-medium">{movement.location_to || '—'}</span>
                  </span>
                ) : (
                  <span>{movement.location_from || movement.location_to || '—'}</span>
                )}
              </p>
            </div>

            {/* Notes */}
            {movement.notes && (
              <div className="rounded-lg border p-4 md:col-span-2">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm whitespace-pre-wrap">{movement.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Meta sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Informations
            </h3>
            <div>
              <p className="text-xs text-muted-foreground">Créé le</p>
              <p className="text-sm font-medium">{formatDate(movement.created_at)}</p>
            </div>
            {movement.updated_at !== movement.created_at && (
              <div>
                <p className="text-xs text-muted-foreground">Modifié le</p>
                <p className="text-sm font-medium">{formatDate(movement.updated_at)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">ID</p>
              <p className="text-xs font-mono text-muted-foreground break-all">{movement.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="text-xs font-mono text-muted-foreground break-all">
                {movement.user_id || '—'}
              </p>
            </div>
            {movement.template_id && (
              <div>
                <p className="text-xs text-muted-foreground">Template ID</p>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {movement.template_id}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
