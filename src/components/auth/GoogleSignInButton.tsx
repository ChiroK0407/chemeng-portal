// Deliberately a plain <a> anchor tag, not an onClick handler calling
// something in AuthContext. This has to be a REAL browser navigation --
// Google's consent screen is a page the user has to see and interact
// with directly; there's no way to do that from inside a fetch/XHR call.
// signInWithGoogle() in AuthContext.tsx exists as a stub for API-surface
// consistency but a plain link is the actually-correct implementation.

interface GoogleSignInButtonProps {
  // Where to send the user after a successful Google sign-in -- passed
  // through the backend's redirect_uri as ?redirect=, round-tripped via
  // the OAuth `state` param (see googleAuth.service.ts), and used by
  // googleCallback to send them back to what they were doing instead of
  // always landing on /dashboard. Defaults to /dashboard when omitted.
  redirectTo?: string
  // When true, renders as a disabled-looking, non-navigating button
  // instead of a real link -- used on the signup page to gate Google
  // sign-in until the join-profile fields (name/stream/type/roll
  // number) are valid. This is a UX nicety only; the real enforcement
  // is server-side (requireMemberProfile on protected routes), since a
  // disabled anchor in the DOM has never stopped anyone who bypasses
  // the frontend entirely.
  disabled?: boolean
  // Called synchronously, immediately before the browser navigates away
  // for the OAuth round trip -- this is the only place to stash data
  // that needs to survive the redirect (see AuthContext.tsx's
  // PENDING_JOIN_STORAGE_KEY). Not called when disabled, since the
  // anchor doesn't navigate in that case anyway.
  onBeforeNavigate?: () => void
}

export function GoogleSignInButton({ redirectTo, disabled, onBeforeNavigate }: GoogleSignInButtonProps) {
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '')
  const href = redirectTo
    ? `${apiBase}/auth/google?redirect=${encodeURIComponent(redirectTo)}`
    : `${apiBase}/auth/google`

  const className =
    "w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors " +
    (disabled
      ? "border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900 text-surface-400 dark:text-surface-600 cursor-not-allowed pointer-events-none"
      : "border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800")

  return (
    <a
      href={disabled ? undefined : href}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      onClick={disabled ? (e) => e.preventDefault() : onBeforeNavigate}
      className={className}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.27-2.09 3.57-5.17 3.57-8.83z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3.02c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.27v3.11C3.25 21.3 7.31 24 12 24z" />
        <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.39-2.29V6.6H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.4l4.02-3.11z" />
        <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4.02 3.11C6.23 6.88 8.88 4.77 12 4.77z" />
      </svg>
      Continue with Google
    </a>
  )
}
