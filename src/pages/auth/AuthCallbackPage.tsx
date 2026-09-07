import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/axios'
import { PageSpinner } from '@/components/ui/Spinner'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      // Fallback redirection if the link context was broken or missing anchors
      navigate('/dashboard')
      return
    }

    // Call your fresh, self-hosted verification route handler
    api.get(`/auth/verify-email/${token}`)
      .then((response) => {
        if (response.data?.success) {
          // If your backend auth response returns tokens directly on confirmation, mount them here:
          if (response.data.data?.accessToken) {
            localStorage.setItem('access_token', response.data.data.accessToken)
            localStorage.setItem('refresh_token', response.data.data.refreshToken)
          }
          navigate('/dashboard?verified=true')
        } else {
          setErrorMsg(response.data?.message || 'Verification sequence loop failed.')
        }
      })
      .catch((err) => {
        console.error('Email verification interception failure:', err)
        setErrorMsg(err.response?.data?.message || 'The authorization confirmation token is invalid or has expired.')
      })
  }, [navigate, searchParams])

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{errorMsg}</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full py-3 px-4 bg-[#1a63ef] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return <PageSpinner />
}