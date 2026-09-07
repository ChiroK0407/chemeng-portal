interface ChipOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  options: ChipOption[];
  selected: string | string[];
  onChange: (value: any) => void;
  multiSelect?: boolean;
  className?: string;
}

export function FilterChips({
  options,
  selected,
  onChange,
  multiSelect = false,
  className = ''
}: FilterChipsProps) {
  
  const isSelected = (value: string) => {
    if (multiSelect && Array.isArray(selected)) {
      return selected.includes(value);
    }
    return selected === value;
  };

  const handleSelect = (value: string) => {
    if (multiSelect && Array.isArray(selected)) {
      if (selected.includes(value)) {
        onChange(selected.filter(item => item !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      onChange(value);
    }
  };

  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-hide w-full max-w-full ${className}`}>
      {options.map((opt) => {
        const active = isSelected(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 pb-2.5 leading-relaxed border ${
              active
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}