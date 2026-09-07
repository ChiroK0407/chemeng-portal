import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  viewAllLabel = 'View all',
  viewAllHref,
  className = ''
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 mb-6 ${className}`}>
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900 dark:text-white leading-relaxed pb-0.5">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-surface-500 dark:text-surface-400 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors shrink-0 group self-start sm:self-auto"
        >
          {viewAllLabel}{' '}
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}