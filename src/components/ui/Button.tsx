import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
  size?:      'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}

const variants = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
  secondary: 'bg-surface-100 text-surface-900 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-100 dark:hover:bg-surface-700',
  outline:   'border border-surface-300 bg-transparent hover:bg-surface-50 dark:border-surface-700 dark:hover:bg-surface-900 text-surface-700 dark:text-surface-300',
  ghost:     'bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300',
  danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  link:      'bg-transparent text-primary-600 hover:underline dark:text-primary-400 p-0 h-auto',
}

const sizes = {
  xs: 'h-7  px-2.5 text-xs  rounded-lg  gap-1',
  sm: 'h-8  px-3   text-sm  rounded-lg  gap-1.5',
  md: 'h-10 px-4   text-sm  rounded-xl  gap-2',
  lg: 'h-12 px-6   text-base rounded-xl gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading
        ? <Spinner size="sm" className="mr-1" />
        : leftIcon
          ? <span className="shrink-0">{leftIcon}</span>
          : null
      }
      {children}
      {rightIcon && !isLoading && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  )
)
Button.displayName = 'Button'