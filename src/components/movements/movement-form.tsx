'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types/product';
import {
  MovementType,
  formatMovementType,
  type StockMovement,
} from '@/types/stock-movement';

const movementSchema = z.object({
  product_id: z.string().min(1, 'Le produit est requis'),
  movement_type: z.enum(['in', 'out', 'adjustment', 'transfer'] as const),
  quantity: z.coerce.number().min(1, 'La quantité doit être ≥ 1'),
  location_from: z.string().optional().or(z.literal('')),
  location_to: z.string().optional().or(z.literal('')),
  reference: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.movement_type === 'transfer') {
      return (data.location_from || '').trim() !== '' && (data.location_to || '').trim() !== '';
    }
    return true;
  },
  {
    message: 'Le transfert nécessite une source et une destination',
    path: ['location_to'],
  }
);

export type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  movement: StockMovement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

function FormSelect({
  value,
  onValueChange,
  placeholder,
  children,
}: {
  value: string | undefined;
  onValueChange: (v: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

export function MovementForm({ movement, open, onOpenChange, onSave }: MovementFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      product_id: '',
      movement_type: 'in',
      quantity: 1,
      location_from: '',
      location_to: '',
      reference: '',
      notes: '',
    },
  });

  const fetchProducts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select('id, name, base_quantity, category_id, supplier_id')
      .order('name');
    setProducts((data || []) as Product[]);
  }, []);

  useEffect(() => {
    if (open) {
      fetchProducts();
      if (movement) {
        setValue('product_id', movement.product_id || '');
        setValue('movement_type', movement.movement_type);
        setValue('quantity', movement.quantity);
        setValue('location_from', movement.location_from ?? '');
        setValue('location_to', movement.location_to ?? '');
        setValue('reference', movement.reference ?? '');
        setValue('notes', movement.notes ?? '');
      } else {
        setValue('product_id', '');
        setValue('movement_type', 'in');
        setValue('quantity', 1);
        setValue('location_from', '');
        setValue('location_to', '');
        setValue('reference', '');
        setValue('notes', '');
      }
    }
  }, [open, movement, setValue, fetchProducts]);

  const onSubmit = async (data: MovementFormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const payload: Record<string, any> = {
        product_id: data.product_id,
        movement_type: data.movement_type,
        quantity: data.quantity,
        location_from: data.location_from || null,
        location_to: data.location_to || null,
        reference: data.reference || null,
        notes: data.notes || null,
      };

      if (movement) {
        await supabase.from('stock_movements').update(payload).eq('id', movement.id);
        const prod = products.find((p) => p.id === data.product_id);
        toast({
          title: 'Mouvement modifié',
          description: `${formatMovementType(data.movement_type)} — ${prod?.name || 'Produit'} mis à jour.`,
        });
      } else {
        await supabase.from('stock_movements').insert(payload);
        const prod = products.find((p) => p.id === data.product_id);
        toast({
          title: 'Mouvement créé',
          description: `${formatMovementType(data.movement_type)} — ${prod?.name || 'Produit'} enregistré.`,
        });
      }
      onSave();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message ?? 'Une erreur est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  const movementType = watch('movement_type');
  const isTransfer = movementType === 'transfer';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {movement ? 'Modifier le mouvement' : 'Nouveau mouvement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Product */}
          <div className="space-y-2">
            <Label htmlFor="product_id">Produit *</Label>
            <FormSelect
              value={movement ? (movement.product_id || '') : ''}
              onValueChange={(v) => setValue('product_id', v)}
              placeholder="Sélectionner un produit..."
            >
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </FormSelect>
            {errors.product_id && (
              <p className="text-sm text-destructive">{errors.product_id.message}</p>
            )}
          </div>

          {/* Movement Type */}
          <div className="space-y-2">
            <Label htmlFor="movement_type">Type de mouvement *</Label>
            <FormSelect
              value={movementType}
              onValueChange={(v) => setValue('movement_type', v as MovementType)}
              placeholder="Sélectionner..."
            >
              <SelectItem value="in">Entrée (In)</SelectItem>
              <SelectItem value="out">Sortie (Out)</SelectItem>
              <SelectItem value="adjustment">Ajustement</SelectItem>
              <SelectItem value="transfer">Transfert</SelectItem>
            </FormSelect>
            {errors.movement_type && (
              <p className="text-sm text-destructive">{errors.movement_type.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité *</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              {...register('quantity')}
              className={errors.quantity ? 'border-destructive' : ''}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          {/* Location from/to for transfers */}
          {isTransfer && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_from">Lieu source *</Label>
                <Input
                  id="location_from"
                  {...register('location_from')}
                  placeholder="Ex: Entrepôt A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_to">Lieu destination *</Label>
                <Input
                  id="location_to"
                  {...register('location_to')}
                  placeholder="Ex: Magasin B"
                />
              </div>
            </div>
          )}

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">Référence (Bon de commande, factures...)</Label>
            <Input
              id="reference"
              {...register('reference')}
              placeholder="Ex: BC-2024-001"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notes optionnelles..."
              rows={3}
            />
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? 'Sauvegarde...' : movement ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
