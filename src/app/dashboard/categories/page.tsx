'use client';

import { useState, useCallback } from 'react';
import { Plus, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Category } from '@/types/category';
import { CategoryForm } from '@/components/categories/category-form';
import { CategoryList } from '@/components/categories/category-list';
import { CategoryDetail } from '@/components/categories/category-detail';
import { toast } from '@/hooks/use-toast';

type Tab = 'list' | 'detail';

export default function CategoriePage() {
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleNew = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleDetail = (category: Category) => {
    setSelectedCategory(category);
    setActiveTab('detail');
  };

  const handleSave = () => {
    setActiveTab('list');
    setSelectedCategory(null);
    toast({ title: 'Sauvegardé', description: 'Les modifications ont été appliquées.' });
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'list', label: 'Liste' },
    { key: 'detail', label: 'Détail' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Catégories</h1>
            <p className="text-muted-foreground">
              Organisez vos produits avec des catégories et sous-catégories
            </p>
          </div>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === 'list') {
                setSelectedCategory(null);
              }
            }}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Separator />

      {activeTab === 'list' && (
        <CategoryList
          onEdit={handleEdit}
          onDetail={handleDetail}
        />
      )}

      {activeTab === 'detail' && selectedCategory && (
        <CategoryDetail
          category={selectedCategory}
          onEdit={handleEdit}
          onBack={() => { setActiveTab('list'); setSelectedCategory(null); }}
        />
      )}

      {activeTab === 'detail' && !selectedCategory && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Aucune catégorie sélectionnée</p>
          <p className="text-sm">Sélectionnez une catégorie dans la liste.</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <CategoryForm
        category={editingCategory}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
      />
    </div>
  );
}
