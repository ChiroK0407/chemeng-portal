import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FlaskConical, ArrowLeft } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/Button'
import { APP_NAME } from '@/utils/constants'

type Status = 'verifying' | 'success' | 'error'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>('verifying')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('This verification link is missing its token.')
      return
    }

    // Runs once per mount, not per token change — a verification link is
    // single-use by design (see consumeEmailVerificationToken on the
    // backend), so there's nothing meaningful to re-run this against.
    let cancelled = false

    authService.verifyEmail(token)
      .then((response) => {
        if (cancelled) return
        if (response?.success === false) {
          setStatus('error')
          setErrorMessage(response.message || 'This verification link is invalid or has expired.')
        } else {
          setStatus('success')
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'This verification link is invalid or has expired.')
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-xl">
            <FlaskConical className="w-7 h-7 text-primary-600" />
            <span className="text-gradient">{APP_NAME}</span>
          </Link>
        </div>

        <div className="card p-8 bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-gray-100 dark:border-surface-800 text-center">
          {status === 'verifying' && (
            <>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">Verifying your email…</h2>
              <p className="text-surface-500 text-sm">This will just take a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">Email verified</h2>
              <p className="text-surface-500 text-sm mb-6">Your email address has been confirmed.</p>
              <Link to="/dashboard">
                <Button className="w-full">Go to dashboard</Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">Verification failed</h2>
              <p className="text-surface-500 text-sm mb-6">{errorMessage}</p>
              <Link to="/dashboard">
                <Button variant="secondary" className="w-full">Go to dashboard anyway</Button>
              </Link>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to login</span>
          </Link>
        </div>

      </div>
    </div>
  )
}
