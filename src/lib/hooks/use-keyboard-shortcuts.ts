'use client';

import { useEffect, useRef, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  onSearchFocus?: () => void;
  onExportToggle?: () => void;
  onEscape?: () => void;
}

/**
 * Global keyboard shortcuts for Stocky.
 * - Ctrl+K / Cmd+K: Focus global search
 * - Ctrl+E: Toggle export menu (on list pages)
 * - Escape: Close modals/menus
 */
export function useKeyboardShortcuts({
  onSearchFocus,
  onExportToggle,
  onEscape,
}: KeyboardShortcutsOptions = {}) {
  const callbacksRef = useRef({ onSearchFocus, onExportToggle, onEscape });

  // Keep ref in sync with latest callbacks
  useEffect(() => {
    callbacksRef.current = { onSearchFocus, onExportToggle, onEscape };
  }, [onSearchFocus, onExportToggle, onEscape]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const { onSearchFocus: sf, onExportToggle: et, onEscape: esc } = callbacksRef.current;

      // Ctrl+K / Cmd+K → focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        sf?.();
      }

      // Ctrl+E → toggle export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        et?.();
      }

      // Escape → close modals/menus
      if (e.key === 'Escape') {
        e.preventDefault();
        esc?.();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}
