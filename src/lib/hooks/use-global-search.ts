'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseGlobalSearchOptions {
  entity: 'products' | 'movements' | 'templates';
  fields?: string[];
  debounceMs?: number;
}

interface SearchResults {
  query: string;
  setQuery: (q: string) => void;
  results: any[];
  loading: boolean;
  total: number;
  clear: () => void;
}

export function useGlobalSearch({
  entity,
  fields,
  debounceMs = 300,
}: UseGlobalSearchOptions): SearchResults {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Default fields per entity
  const searchFields = fields || {
    products: ['name', 'description', 'id'],
    movements: ['reference', 'notes', 'id'],
    templates: ['name', 'description', 'id'],
  }[entity] || ['name'];

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setTotal(0);
  }, []);

  // Debounced search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const supabase = createClient();

        const fieldList = Array.isArray(searchFields)
          ? searchFields.join('","')
          : searchFields;
        const ilikePattern = `%${query}%`;

        // Build ILIKE condition for multiple fields
        const ilikeCond = searchFields
          .map((f) => `${f}.ilike.%${query}%`)
          .join(',');

        let queryBuilder = supabase
          .from(entity)
          .select('*', { count: 'exact' })
          .or(ilikeCond)
          .limit(20);

        if (entity === 'products') {
          queryBuilder = queryBuilder.order('name', { ascending: true });
        } else if (entity === 'movements') {
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
        }

        const { data, count, error } = await queryBuilder;
        if (error) throw error;

        setResults(data || []);
        setTotal(count || 0);
      } catch (err) {
        console.error(`Search failed for ${entity}:`, err);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, entity, searchFields, debounceMs]);

  return { query, setQuery, results, loading, total, clear };
}
