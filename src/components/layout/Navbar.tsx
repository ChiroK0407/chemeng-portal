import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, FlaskConical, Lock, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { cn }       from '@/utils/cn'
import { APP_NAME } from '@/utils/constants'

const NAV_LINKS = [
  { label: 'Organisations', href: '/organisations' },
  { label: 'Projects',      href: '/projects' },
  { label: 'Blogs',         href: '/blogs' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Events',        href: '/events' },
  { label: 'Quizzes',       href: '/quizzes' },
  { label: 'Members',       href: '/members' },
  { label: 'Resources',     href: '/resources' },
]

// Shown in place of "Join" once signed in, on every page — driven by
// AuthContext, which is provided above the router, so this stays correct
// across navigation without any extra plumbing here.
function UserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800 transition-colors"
      >
        {user.full_name}
        <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-lg py-1 z-50">
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleMobileSignOut() {
    setMobileOpen(false)
    await signOut()
    window.location.href = '/' // full reload to fully reset app state after mobile sign-out
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-200/80 dark:bg-surface-950/80 dark:border-surface-800/80">
      <nav className="container-page flex h-16 items-center justify-between">

        {/* Brand — drop your real logo file at /public/logo.svg (or .png)
            and this renders it automatically; falls back to the flask
            icon if that file doesn't exist yet, so nothing breaks in the
            meantime. Swap the fallback icon for your own once you have a
            simplified monochrome mark, if you'd rather not rely on the
            <img onError> fallback long-term. */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <img
            src="/logo.svg"
            alt={APP_NAME}
            className="w-7 h-7 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
          <FlaskConical className="w-6 h-6 text-primary-600 hidden" />
          <span className="text-gradient">{APP_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) => cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-950'
                  : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800'
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors"
          >
            {resolvedTheme === 'dark'
              ? <Sun className="w-5 h-5" />
              : <Moon className="w-5 h-5" />
            }
          </button>

          {/* "Join" before login, user's name + dropdown after — sits
              beside the theme toggle, admin lock stays the rightmost item. */}
          {user ? (
            <UserMenu />
          ) : (
            <Link
              to="/auth/login"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Join
            </Link>
          )}

          <Link
            to="/admin"
            aria-label="Admin"
            className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors"
          >
            <Lock className="w-5 h-5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-lg text-surface-600 dark:text-surface-400"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 p-4 space-y-1">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'block px-3 py-2 rounded-lg text-sm font-medium',
                isActive
                  ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-950'
                  : 'text-surface-700 dark:text-surface-300'
              )}
            >
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                <LayoutDashboard className="w-4 h-4" /> {user.full_name} — Dashboard
              </Link>
              <button
                onClick={handleMobileSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </>
          ) : (
            <Link
              to="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-600"
            >
              Join
            </Link>
          )}

          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-surface-500 dark:text-surface-400"
          >
            <Lock className="w-4 h-4" /> Admin
          </Link>
        </div>
      )}
    </header>
  )
}