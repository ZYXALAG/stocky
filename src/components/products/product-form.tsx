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
import {
  type Product,
  type Category,
  type Supplier,
} from '@/types/product';
import { generateSKU } from '@/lib/products';

const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().min(0),
  photo_url: z.string().min(0),
  category_id: z.string().nullable().optional(),
  supplier_id: z.string().nullable().optional(),
  base_quantity: z.coerce.number().min(0, 'La quantité doit être ≥ 0'),
  base_cost_price: z.coerce.number().min(0, 'Le coût doit être ≥ 0').nullable().optional(),
  base_selling_price: z.coerce.number().min(0, 'Le prix de vente doit être ≥ 0').nullable().optional(),
  alert_threshold: z.coerce.number().min(0, 'Le seuil d&apos;alerte doit être ≥ 0'),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

// Wrapper Select component that works with react-hook-form
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

export function ProductForm({ product, open, onOpenChange, onSave }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      photo_url: '',
      category_id: null,
      supplier_id: null,
      base_quantity: 0,
      base_cost_price: null,
      base_selling_price: null,
      alert_threshold: 5,
    },
  });

  const fetchOptions = useCallback(async () => {
    const supabase = createClient();
    const [{ data: cats }, { data: supp }] = await Promise.all([
      supabase.from('categories').select('id, name, parent_id, created_at').order('name'),
      supabase.from('suppliers').select('id, name, contact_name, email, phone, address, created_at').order('name'),
    ]);
    setCategories((cats || []) as Category[]);
    setSuppliers((supp || []) as Supplier[]);
  }, []);

  useEffect(() => {
    if (open) {
      fetchOptions();
      if (product) {
        setValue('name', product.name);
        setValue('description', product.description ?? '');
        setValue('photo_url', product.photo_url ?? '');
        setValue('category_id', product.category_id);
        setValue('supplier_id', product.supplier_id);
        setValue('base_quantity', product.base_quantity);
        setValue('base_cost_price', product.base_cost_price);
        setValue('base_selling_price', product.base_selling_price);
        setValue('alert_threshold', product.alert_threshold);
      } else {
        setValue('name', '');
        setValue('description', '');
        setValue('photo_url', '');
        setValue('category_id', null);
        setValue('supplier_id', null);
        setValue('base_quantity', 0);
        setValue('base_cost_price', null);
        setValue('base_selling_price', null);
        setValue('alert_threshold', 5);
      }
    }
  }, [open, product, setValue, fetchOptions]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const payload: Record<string, any> = {
        name: data.name,
        description: data.description || null,
        photo_url: data.photo_url || null,
        category_id: data.category_id,
        supplier_id: data.supplier_id,
        base_quantity: data.base_quantity,
        base_cost_price: data.base_cost_price ?? null,
        base_selling_price: data.base_selling_price ?? null,
        alert_threshold: data.alert_threshold,
      };

      if (product) {
        await supabase.from('products').update(payload).eq('id', product.id);
        toast({ title: 'Produit modifié', description: `${data.name} a été mis à jour.` });
      } else {
        await supabase.from('products').insert(payload);
        toast({ title: 'Produit créé', description: `${data.name} a été ajouté.` });
      }
      onSave();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message ?? 'Une erreur est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm(`Supprimer "${product.name}" ?`)) return;
    try {
      const supabase = createClient();
      await supabase.from('products').delete().eq('id', product.id);
      toast({ title: 'Produit supprimé', description: `${product.name} a été supprimé.` });
      onSave();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message ?? 'Suppression échouée.' });
    }
  };

  const handleGenerateSKU = useCallback(() => {
    const sku = generateSKU(product?.template_id || undefined);
    // Could store in custom_fields or a separate SKU field
    toast({ title: 'SKU généré', description: `${sku} — ajoutez-le aux champs personnalisés.` });
  }, [product]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Vis à bois 4×40"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Description optionnelle..."
              rows={3}
            />
          </div>

          {/* Photo URL */}
          <div className="space-y-2">
            <Label htmlFor="photo_url">URL de l&apos;image</Label>
            <Input
              id="photo_url"
              {...register('photo_url')}
              placeholder="https://..."
            />
          </div>

          {/* Category + Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <FormSelect
                value={product ? (product.category_id || '') : ''}
                onValueChange={(v) => {
                  setValue('category_id', v === '__none__' ? null : v);
                }}
                placeholder="Sélectionner..."
              >
                <SelectItem value="__none__">Aucune</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </FormSelect>
            </div>

            <div className="space-y-2">
              <Label>Fournisseur</Label>
              <FormSelect
                value={product ? (product.supplier_id || '') : ''}
                onValueChange={(v) => {
                  setValue('supplier_id', v === '__none__' ? null : v);
                }}
                placeholder="Sélectionner..."
              >
                <SelectItem value="__none__">Aucun</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </FormSelect>
            </div>
          </div>

          {/* Quantity + Alert threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_quantity">Quantité initiale</Label>
              <Input
                id="base_quantity"
                type="number"
                min={0}
                {...register('base_quantity')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert_threshold">Seuil d&apos;alerte</Label>
              <Input
                id="alert_threshold"
                type="number"
                min={0}
                {...register('alert_threshold')}
              />
            </div>
          </div>

          {/* Cost price + Selling price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_cost_price">Prix de coût</Label>
              <Input
                id="base_cost_price"
                type="number"
                step="0.01"
                min={0}
                {...register('base_cost_price')}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_selling_price">Prix de vente</Label>
              <Input
                id="base_selling_price"
                type="number"
                step="0.01"
                min={0}
                {...register('base_selling_price')}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* SKU generation helper */}
          {product && (
            <div className="rounded-lg border border-dashed p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">SKU / QR</span>
              <Button variant="outline" size="sm" type="button" onClick={handleGenerateSKU}>
                Générer SKU
              </Button>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting || !product}
            >
              Supprimer
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? 'Sauvegarde...' : product ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
