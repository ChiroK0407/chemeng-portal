interface SkeletonCardProps {
  variant: 'psu' | 'project' | 'blog' | 'event' | 'opportunity' | 'member';
  className?: string;
}

export function SkeletonCard({ variant, className = '' }: SkeletonCardProps) {
  // Master base element style token containing shimmer animations
  const baseAnimation = 'animate-pulse bg-surface-200 dark:bg-surface-800';

  const renderLayout = () => {
    switch (variant) {
      case 'psu':
        return (
          <div className="p-5 border border-surface-200 dark:border-surface-800 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className={`w-12 h-12 rounded-xl ${baseAnimation}`} />
              <div className={`w-20 h-5 rounded-md ${baseAnimation}`} />
            </div>
            <div className="space-y-2">
              <div className={`w-3/4 h-5 rounded ${baseAnimation}`} />
              <div className={`w-1/2 h-3 rounded ${baseAnimation}`} />
            </div>
            <div className="pt-4 border-t border-surface-100 dark:border-surface-800 space-y-2">
              <div className={`w-full h-4 rounded ${baseAnimation}`} />
              <div className={`w-full h-9 rounded-xl ${baseAnimation}`} />
            </div>
          </div>
        );

      case 'opportunity':
        return (
          <div className="p-5 border border-surface-200 dark:border-surface-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`w-12 h-12 rounded-xl shrink-0 ${baseAnimation}`} />
              <div className="space-y-2 flex-1">
                <div className="flex gap-2"><div className={`w-1/2 h-5 rounded ${baseAnimation}`} /><div className={`w-16 h-4 rounded ${baseAnimation}`} /></div>
                <div className={`w-1/3 h-4 rounded ${baseAnimation}`} />
                <div className={`w-2/3 h-3 rounded ${baseAnimation}`} />
              </div>
            </div>
            <div className={`w-24 h-8 rounded-xl shrink-0 self-end sm:self-auto ${baseAnimation}`} />
          </div>
        );

      case 'blog':
        return (
          <div className="border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden flex flex-col h-full">
            <div className={`w-full h-44 ${baseAnimation}`} />
            <div className="p-5 flex-1 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className={`w-full h-5 rounded ${baseAnimation}`} />
                <div className={`w-2/3 h-5 rounded ${baseAnimation}`} />
                <div className={`w-full h-3 rounded ${baseAnimation}`} />
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-surface-100 dark:border-surface-800">
                <div className="flex items-center gap-2"><div className={`w-6 h-6 rounded-full ${baseAnimation}`} /><div className={`w-16 h-3 rounded ${baseAnimation}`} /></div>
                <div className={`w-12 h-3 rounded ${baseAnimation}`} />
              </div>
            </div>
          </div>
        );

      case 'event':
        return (
          <div className="border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden flex flex-col">
            <div className={`w-full h-40 ${baseAnimation}`} />
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className={`w-16 h-4 rounded ${baseAnimation}`} />
                <div className={`w-full h-5 rounded ${baseAnimation}`} />
                <div className={`w-3/4 h-3 rounded ${baseAnimation}`} />
              </div>
              <div className="pt-4 border-t border-surface-100 dark:border-surface-800 space-y-2">
                <div className={`w-full h-2 rounded-full ${baseAnimation}`} />
                <div className={`w-full h-8 rounded-xl ${baseAnimation}`} />
              </div>
            </div>
          </div>
        );

      case 'member':
        return (
          <div className="p-5 border border-surface-200 dark:border-surface-800 rounded-2xl flex flex-col items-center text-center space-y-4">
            <div className={`w-16 h-16 rounded-full ${baseAnimation}`} />
            <div className="space-y-1.5 w-full flex flex-col items-center">
              <div className={`w-2/3 h-4 rounded ${baseAnimation}`} />
              <div className={`w-1/3 h-3.5 rounded ${baseAnimation}`} />
            </div>
            <div className="w-full space-y-2 pt-2">
              <div className={`w-full h-3 rounded ${baseAnimation}`} />
              <div className={`w-5/6 h-3 rounded mx-auto ${baseAnimation}`} />
            </div>
            <div className="w-full pt-4 border-t border-surface-100 dark:border-surface-800 flex justify-between items-center">
              <div className="flex gap-2"><div className={`w-4 h-4 rounded ${baseAnimation}`} /><div className={`w-4 h-4 rounded ${baseAnimation}`} /></div>
              <div className={`w-20 h-7 rounded-xl ${baseAnimation}`} />
            </div>
          </div>
        );

      default: // Default layout mapping placeholder matches 'project' card proportions
        return (
          <div className="p-5 border border-surface-200 dark:border-surface-800 rounded-2xl space-y-3">
            <div className={`w-20 h-4 rounded ${baseAnimation}`} />
            <div className={`w-full h-5 rounded ${baseAnimation}`} />
            <div className="space-y-1.5">
              <div className={`w-full h-3 rounded ${baseAnimation}`} />
              <div className={`w-5/6 h-3 rounded ${baseAnimation}`} />
            </div>
          </div>
        );
    }
  };

  return <div className={`bg-white dark:bg-surface-900 shadow-sm ${className}`}>{renderLayout()}</div>;
}