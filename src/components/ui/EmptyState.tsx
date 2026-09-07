import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon?:        React.ReactNode
  title:        string
  description?: string
  action?:      React.ReactNode
  className?:   string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && (
        <div className="mb-4 text-surface-300 dark:text-surface-700">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-surface-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && action}
    </div>
  )
}