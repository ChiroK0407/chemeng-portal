import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Spin up an isolated timer interval thread hook
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Wipe down active callback flags instantly if component shifts parameters
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}