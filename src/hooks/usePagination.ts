import { useState, useCallback } from 'react';

export interface UsePaginationResult {
  page: number;
  totalPages: number;
  hasMore: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (targetPage: number) => void;
  reset: () => void;
}

export function usePagination(totalCount: number, pageSize: number = 12): UsePaginationResult {
  const [page, setPage] = useState<number>(1);

  // Compute bounding parameters safely using standard rounding rules
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
  const hasMore = page < totalPages;

  const nextPage = useCallback(() => {
    setPage(prev => (prev < totalPages ? prev + 1 : prev));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage(prev => (prev > 1 ? prev - 1 : prev));
  }, []);

  const goToPage = useCallback((targetPage: number) => {
    const sanitizedPage = Math.max(1, Math.min(targetPage, totalPages));
    setPage(sanitizedPage);
  }, [totalPages]);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    totalPages,
    hasMore,
    nextPage,
    prevPage,
    goToPage,
    reset
  };
}