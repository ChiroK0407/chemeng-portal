import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FlaskConical, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { APP_NAME } from '@/utils/constants'

const schema = z.object({
  email: z.string().email('Please enter a valid engineering email channel'),
  password: z.string().min(1, 'Password field cannot be blank'),
})

type FormData = z.infer<typeof schema>

// Maps the `?error=` query param the backend's Google OAuth callback
// redirects back with on failure (see googleCallback in
// userAuth.controller.ts) to a message worth showing someone, rather
// than a raw error code.
const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_denied:            'Google sign-in was cancelled.',
  invalid_callback:         'Something went wrong completing Google sign-in. Please try again.',
  state_mismatch:           'Your Google sign-in session expired. Please try again.',
  google_email_unverified:  'Your Google account email isn\'t verified. Please verify it with Google first.',
  google_auth_failed:       'Google sign-in failed. Please try again or use your email and password.',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { signIn } = useAuth()

  // Set by RequireAuth (src/routes/index.tsx) when someone is redirected
  // here from a login-required action — e.g. starting a quiz attempt.
  // Falls back to '/' (not '/dashboard') when arriving here directly,
  // matching the Google OAuth flow's own default in userAuth.controller.ts.
  const fromPath = (location.state as { from?: string } | null)?.from ?? '/'
  
  // State tracker to hold backend error messages inline
  const [apiError, setApiError] = useState<string | null>(null)

  // Surface a Google OAuth failure the same way a normal login failure
  // shows -- the backend redirects back here with ?error=<code> rather
  // than a JSON response, since this whole flow is full-page navigations.
  useEffect(() => {
    const errorCode = searchParams.get('error')
    if (errorCode) {
      setApiError(GOOGLE_ERROR_MESSAGES[errorCode] || 'Google sign-in failed. Please try again.')
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      setApiError(null) // Clear any historical layout errors
      await signIn(data.email, data.password)
      navigate(fromPath)
    } catch (err: any) {
      console.error('Authentication client routing error intercepted:', err)
      
      // Safely check and extract the message property from the custom Axios error payload
      const friendlyMessage = 
        err.response?.data?.message || 
        err.message || 
        'Invalid email or password combination.'
      setApiError(friendlyMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-md">

        {/* Brand Identity Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-xl">
            <FlaskConical className="w-7 h-7 text-primary-600" />
            <span className="text-gradient">{APP_NAME}</span>
          </Link>
          <h1 className="mt-6 text-2xl font-display font-semibold text-surface-900 dark:text-surface-100">
            Sign in to your portal account
          </h1>
        </div>

        <div className="card p-8 bg-white dark:bg-surface-900 border border-gray-100 dark:border-surface-800 rounded-2xl shadow-sm">
          
          {/* HIGH-VISIBILITY ERROR INTERFACE IN THE CENTER OF THE CARD */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-red-900">Authentication Warning</h4>
                <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{apiError}</p>
              </div>
            </div>
          )}

          <GoogleSignInButton redirectTo={fromPath} />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
            <span className="text-xs text-surface-400 uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
                <Link to="/auth/forgot-password" className="text-xs font-medium text-[#1a63ef] hover:underline">
                  Forgot password?
                </Link>
              </div>
              
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            {/* Fixed code 2322: Swapped prop back to target interface 'isLoading' */}
            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-surface-500">
          Don't have an engineering profile card yet?{' '}
          <Link to="/auth/signup" className="font-semibold text-[#1a63ef] hover:underline">
            Register Account
          </Link>
        </p>

      </div>
    </div>
  )
}