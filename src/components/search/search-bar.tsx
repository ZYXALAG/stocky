'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Keyboard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGlobalSearch } from '@/lib/hooks/use-global-search';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  entity?: 'products' | 'movements' | 'templates';
  fields?: string[];
  onResultClick?: (item: any) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  entity = 'products',
  fields,
  onResultClick,
  placeholder = 'Rechercher...',
  className,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);

  const { query, setQuery, results, loading, total, clear } = useGlobalSearch({
    entity,
    fields,
    debounceMs: 300,
  });

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showDropdown]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if (val.trim()) setShowDropdown(true);
      else setShowDropdown(false);
    },
    [setQuery]
  );

  const handleFocus = useCallback(() => {
    if (query.trim() && total > 0) setShowDropdown(true);
  }, [query, total]);

  const handleClear = useCallback(() => {
    clear();
    setShowDropdown(false);
    inputRef.current?.focus();
  }, [clear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setShowDropdown(true);
        setFocusedIdx((prev) => Math.min(prev + 1, (results || []).length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setShowDropdown(true);
        setFocusedIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && focusedIdx >= 0 && results[focusedIdx]) {
        e.preventDefault();
        onResultClick?.(results[focusedIdx]);
        setShowDropdown(false);
        setFocusedIdx(-1);
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    },
    [results, focusedIdx, onResultClick]
  );

  const handleResultClick = useCallback(
    (item: any) => {
      onResultClick?.(item);
      setShowDropdown(false);
    },
    [onResultClick]
  );

  return (
    <div className={cn('relative', className)} ref={resultsRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <kbd className="pointer-events-none absolute right-3 top-1/2 flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <Keyboard className="h-3 w-3" />K
        </kbd>
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-20"
        />
      </div>

      {query.trim() && (
        <button
          onClick={handleClear}
          className="absolute right-12 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="Effacer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Dropdown results */}
      {showDropdown && query.trim() && (
        <div className="absolute z-50 mt-1 w-full max-w-md rounded-md border bg-popover p-1 shadow-md">
          {loading ? (
            <div className="flex items-center justify-center py-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-64 overflow-auto">
              {results.map((item: any, idx: number) => (
                <button
                  key={item.id || idx}
                  onClick={() => handleResultClick(item)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors',
                    focusedIdx === idx
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  )}
                >
                  <span className="truncate font-medium">
                    {item.name || item.reference || item.id}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-3 text-center text-sm text-muted-foreground">
              Aucun résultat
            </div>
          )}
          {total > 0 && (
            <div className="border-t px-2 py-1.5 text-xs text-muted-foreground">
              {total} résultat{total > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
