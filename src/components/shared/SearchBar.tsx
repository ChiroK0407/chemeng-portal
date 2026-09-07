import { useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (debouncedValue: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  delay = 300
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, delay);

  // Synchronize internal value state if parent modifies it externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Bubble up the debounced modification events to parent query blocks
  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  const handleClear = () => {
    setLocalValue('');
  };

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}