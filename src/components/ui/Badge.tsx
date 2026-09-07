import { cn } from '@/utils/cn'

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral'

interface BadgeProps {
  variant?:   BadgeVariant
  className?: string
  children:   React.ReactNode
}

const variants: Record<BadgeVariant, string> = {
  primary: 'badge-primary',
  accent:  'badge-accent',
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  neutral: 'badge-neutral',
}

export function Badge({ variant = 'neutral', className, children }: BadgeProps) {
  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  )
}