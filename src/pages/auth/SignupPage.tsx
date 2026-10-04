import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FlaskConical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth, PENDING_JOIN_STORAGE_KEY } from '@/context/AuthContext'
import api from '@/lib/axios'
import { Button }   from '@/components/ui/Button'
import { Input }    from '@/components/ui/Input'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { APP_NAME } from '@/utils/constants'

const ROLL_NUMBER_PATTERN = /^[0-9]{12}$/

// stream is a single fixed literal today ('BChE') rather than a free
// dropdown of one -- adding a second stream later is a one-line change
// here (z.enum(['BChE', 'NewStream']) + one more <option>), no backend
// schema change needed since members.branch is already free TEXT.
const schema = z.object({
  full_name:        z.string().min(2, 'Name must be at least 2 characters'),
  stream:           z.literal('BChE'),
  member_type:      z.enum(['student', 'alumni'], { errorMap: () => ({ message: 'Select student or alumni' }) }),
  roll_number:      z.string().optional(),
  email:            z.string().email('Enter a valid email'),
  password:         z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path:    ['confirm_password'],
}).refine(
  data => data.member_type !== 'student' || ROLL_NUMBER_PATTERN.test(data.roll_number ?? ''),
  { message: 'Roll number must be exactly 12 digits', path: ['roll_number'] }
)

type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onChange' })

  const fullName   = watch('full_name')
  const stream     = watch('stream')
  const memberType = watch('member_type')
  const rollNumber = watch('roll_number')

  // Gates BOTH sign-up paths (password submit button and the Google
  // button) — computed live from the watched fields rather than from
  // RHF's errors object, since errors only populate after a field has
  // been validated/touched, and these buttons need to reflect validity
  // before the user ever attempts to submit.
  const isProfileComplete =
    !!fullName && fullName.trim().length >= 2 &&
    stream === 'BChE' &&
    (memberType === 'student' || memberType === 'alumni') &&
    (memberType === 'alumni' || ROLL_NUMBER_PATTERN.test(rollNumber ?? ''))

  function buildJoinPayload(data: FormData) {
    return {
      fullName: data.full_name,
      branch: data.stream,
      category: data.member_type === 'student' ? 'current' : 'alumni',
      rollNumber: data.member_type === 'student' ? data.roll_number : undefined,
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      await signUp(data.email, data.password, data.full_name)
      // No page-away redirect on this path (unlike Google), so the
      // member card can be created right here in the same request
      // chain — no sessionStorage bridge needed for password signup.
      try {
        await api.post('/members/join', buildJoinPayload(data))
      } catch {
        // Surfacing this as a hard failure would strand an otherwise-
        // successful account creation over a secondary step; the user
        // can still complete their profile from the dashboard if this
        // silently didn't go through (e.g. a transient network blip).
      }
      toast.success('Account created! Please check your email to confirm.')
      navigate('/auth/login')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      toast.error(message)
    }
  }

  // Google DOES leave the page for the OAuth round trip, so the profile
  // fields have to be cached somewhere that survives a full page unload.
  // AuthContext picks this up and calls /members/join automatically once
  // the post-OAuth session is confirmed — see completePendingJoin there.
  function cacheJoinDataBeforeGoogleRedirect() {
    sessionStorage.setItem(
      PENDING_JOIN_STORAGE_KEY,
      JSON.stringify(buildJoinPayload({
        full_name: fullName, stream, member_type: memberType, roll_number: rollNumber,
        email: '', password: '', confirm_password: '',
      } as FormData))
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-xl">
            <FlaskConical className="w-7 h-7 text-primary-600" />
            <span className="text-gradient">{APP_NAME}</span>
          </Link>
          <h1 className="mt-6 text-2xl font-display font-semibold text-surface-900 dark:text-surface-100">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            Join the {APP_NAME} community today
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ── Step 1: member profile — gates both sign-up paths below ── */}
            <Input
              label="Full Name"
              type="text"
              placeholder="Your full name"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Stream
              </label>
              <select
                className="input-base"
                defaultValue=""
                {...register('stream')}
              >
                <option value="" disabled>Select your stream</option>
                <option value="BChE">BChE</option>
                {/* Add more <option> entries here as new streams open up —
                    members.branch is free TEXT, no schema change needed. */}
              </select>
              {errors.stream && <p className="mt-1 text-xs text-red-600">Select a stream</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                I am a
              </label>
              <select
                className="input-base"
                defaultValue=""
                {...register('member_type')}
              >
                <option value="" disabled>Select type</option>
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
              </select>
              {errors.member_type && <p className="mt-1 text-xs text-red-600">{errors.member_type.message}</p>}
            </div>

            {memberType === 'student' && (
              <Input
                label="Roll Number"
                type="text"
                inputMode="numeric"
                maxLength={12}
                placeholder="12-digit roll number"
                error={errors.roll_number?.message}
                {...register('roll_number')}
              />
            )}

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
              <span className="text-xs text-surface-400 uppercase tracking-wide">
                {isProfileComplete ? 'Choose how to sign up' : 'Fill in the fields above first'}
              </span>
              <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
            </div>

            {/* ── Step 2: both sign-up paths, locked until step 1 is valid ── */}
            <GoogleSignInButton
              disabled={!isProfileComplete}
              onBeforeNavigate={cacheJoinDataBeforeGoogleRedirect}
            />

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
              <span className="text-xs text-surface-400 uppercase tracking-wide">or</span>
              <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
            </div>

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
              disabled={!isProfileComplete}
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
