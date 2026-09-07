import { Link } from 'react-router-dom'
import { FlaskConical, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <FlaskConical className="w-16 h-16 text-primary-600 mb-6 opacity-30" />
      <h1 className="text-8xl font-display font-bold text-surface-100 dark:text-surface-800 mb-2">
        404
      </h1>
      <h2 className="text-2xl font-display font-semibold text-surface-900 dark:text-surface-100 mb-3">
        Page not found
      </h2>
      <p className="text-surface-500 max-w-md mb-8">
        This reaction didn't yield any results. The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button leftIcon={<Home className="w-4 h-4" />}>
          Back to Home
        </Button>
      </Link>
    </div>
  )
}