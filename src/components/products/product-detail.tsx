'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ProductDetailProps {
  product: Product;
  categories: Map<string, string>;
  suppliers: Map<string, string>;
  onEdit: (product: Product) => void;
  onBack: () => void;
}

export function ProductDetail({ product, categories, suppliers, onEdit, onBack }: ProductDetailProps) {
  const lowStock = product.base_quantity <= product.alert_threshold;
  const stockValue = (product.base_quantity || 0) * (product.base_cost_price || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex-1" />
        <Button onClick={() => onEdit(product)}>
          Éditer le produit
        </Button>
      </div>

      <Separator />

      {/* Info Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.description && (
              <p className="mt-2 text-muted-foreground">{product.description}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Catégorie</p>
              <p className="mt-1 font-medium">
                {product.category_id
                  ? categories.get(product.category_id) || '—'
                  : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Fournisseur</p>
              <p className="mt-1 font-medium">
                {product.supplier_id
                  ? suppliers.get(product.supplier_id) || '—'
                  : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Quantité en stock</p>
              <p className={`mt-1 text-2xl font-bold font-mono ${lowStock ? 'text-destructive' : ''}`}>
                {product.base_quantity}
              </p>
              {lowStock && (
                <Badge variant="destructive" className="mt-2">
                  Stock insuffisant
                </Badge>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Seuil d&apos;alerte</p>
              <p className="mt-1 text-2xl font-bold font-mono">{product.alert_threshold}</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Prix d&apos;achat unitaire</p>
              <p className="mt-1 text-2xl font-bold font-mono">
                {product.base_cost_price ? `${product.base_cost_price.toFixed(2)} €` : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Prix de vente unitaire</p>
              <p className="mt-1 text-2xl font-bold font-mono">
                {product.base_selling_price ? `${product.base_selling_price.toFixed(2)} €` : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4 md:col-span-2">
              <p className="text-sm text-muted-foreground">Valeur du stock</p>
              <p className="mt-1 text-2xl font-bold font-mono text-primary">
                {stockValue.toFixed(2)} €
              </p>
            </div>
          </div>

          {product.photo_url && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Image du produit</p>
              <img
                src={product.photo_url}
                alt={product.name}
                className="max-h-64 rounded-lg border object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Meta sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Informations
            </h3>
            <div>
              <p className="text-xs text-muted-foreground">Créé le</p>
              <p className="text-sm font-medium">{formatDate(product.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Modifié le</p>
              <p className="text-sm font-medium">{formatDate(product.updated_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ID</p>
              <p className="text-xs font-mono text-muted-foreground break-all">{product.id}</p>
            </div>
          </div>

          {Object.keys(product.custom_fields || {}).length > 0 && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Champs personnalisés
              </h3>
              {Object.entries(product.custom_fields).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                  <p className="text-sm font-medium">{String(value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
