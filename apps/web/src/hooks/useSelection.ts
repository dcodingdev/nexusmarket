import { useState, useCallback } from 'react';

export function useSelection<T = string>(initialSelection: T[] = []) {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set(initialSelection));

  const toggle = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: T[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: T) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  return {
    selectedIds: Array.from(selectedIds),
    toggle,
    selectAll,
    clear,
    isSelected,
    count: selectedIds.size,
  };
}

