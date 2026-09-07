import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FlaskConical, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
// 1. Import your newly constructed typesafe custom authService
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      // 2. Dispatch request to your custom self-hosted API pipeline via Axios
      const response = await authService.forgotPassword(data.email)
      
      if (response?.success === false) {
        throw new Error(response.message || 'Failed to dispatch recovery link.')
      }

      toast.success('Reset link sent! Check your inbox.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-xl">
            <FlaskConical className="w-7 h-7 text-primary-600" />
            <span className="text-gradient">ChemEng Portal</span>
          </Link>
          <h1 className="mt-6 text-2xl font-display font-semibold text-surface-900 dark:text-surface-100">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="card p-8">
          {isSubmitSuccessful ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">
                Check your inbox
              </h3>
              <p className="text-sm text-surface-500">
                We sent a password reset link to your email address.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
              >
                Send reset link
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
            <span className="font-medium">Back to login</span>
          </Link>
        </div>

      </div>
    </div>
  )
}