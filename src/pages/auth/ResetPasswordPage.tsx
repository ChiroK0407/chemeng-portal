import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FlaskConical, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('The password recovery token is missing. Please initiate a new request.')
      return
    }

    try {
      const response = await authService.resetPassword({
        token,
        password: data.password
      })

      if (response?.success === false) {
        throw new Error(response.message || 'Failed to update credentials.')
      }

      toast.success('Password updated successfully! Redirecting to login...')
      setTimeout(() => navigate('/auth/login'), 2500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    }
  }

  // Defensive block if a user navigates to the route without an email link token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-surface-50 dark:bg-surface-950">
        <div className="max-w-md w-full text-center card p-8 border border-gray-100 dark:border-surface-800 shadow-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">Invalid Reset URL</h2>
          <p className="text-surface-500 text-sm mb-6">
            This password mutation channel is missing its authentication context. Please request a new security loop.
          </p>
          <Link
            to="/auth/forgot-password"
            className="inline-flex w-full items-center justify-center py-3 px-4 bg-[#1a63ef] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
          >
            Go to Forgot Password
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-md">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-xl">
            <FlaskConical className="w-7 h-7 text-primary-600" />
            <span className="text-gradient">ChemEng Portal</span>
          </Link>
          <h1 className="mt-6 text-2xl font-display font-semibold text-surface-900 dark:text-surface-100">
            Configure New Password
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            Enter your new credentials below to restore your platform profile status.
          </p>
        </div>

        <div className="card p-8 bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-gray-100 dark:border-surface-800">
          {isSubmitSuccessful ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-1">
                Account Secured!
              </h3>
              <p className="text-sm text-surface-500">
                Your credentials have been updated. Preparing redirect hook...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* New Password Field */}
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password Field */}
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                Update Password
              </Button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel and return to login</span>
          </Link>
        </div>

      </div>
    </div>
  )
}