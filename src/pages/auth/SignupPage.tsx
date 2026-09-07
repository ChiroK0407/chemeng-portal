import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FlaskConical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth }  from '@/context/AuthContext'
import { Button }   from '@/components/ui/Button'
import { Input }    from '@/components/ui/Input'

const schema = z.object({
  full_name:        z.string().min(2, 'Name must be at least 2 characters'),
  email:            z.string().email('Enter a valid email'),
  password:         z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path:    ['confirm_password'],
})

type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await signUp(data.email, data.password, { full_name: data.full_name })
      toast.success('Account created! Please check your email to confirm.')
      navigate('/auth/login')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed'
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            Join the ChemEng community today
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your full name"
              error={errors.full_name?.message}
              {...register('full_name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <p className="text-xs text-surface-400 leading-relaxed">
              By signing up you agree to our terms of service and privacy policy.
            </p>

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-surface-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="text-primary-600 hover:underline dark:text-primary-400 font-medium"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}