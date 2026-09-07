import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Sun, Moon, FlaskConical, Bell } from 'lucide-react'
import { useAuth }  from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button }   from '@/components/ui/Button'
import { cn }       from '@/utils/cn'

const NAV_LINKS = [
  { label: 'PSUs',          href: '/psu' },
  { label: 'Projects',      href: '/projects' },
  { label: 'Blogs',         href: '/blogs' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Events',        href: '/events' },
  { label: 'Members',       href: '/members' },
  { label: 'Resources',     href: '/resources' },
]

export function Navbar() {
  const { user, signOut }          = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-200/80 dark:bg-surface-950/80 dark:border-surface-800/80">
      <nav className="container-page flex h-16 items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <FlaskConical className="w-6 h-6 text-primary-600" />
          <span className="text-gradient">ChemEng Portal</span>
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

          {user ? (
            <>
              <Link to="/dashboard/notifications">
                <button className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/dashboard">
                <Button size="sm" variant="secondary">Dashboard</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={signOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button size="sm" variant="ghost">Sign in</Button>
              </Link>
              <Link to="/auth/signup">
                <Button size="sm">Join Now</Button>
              </Link>
            </>
          )}
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
          <div className="pt-2 flex gap-2">
            {user ? (
              <Button size="sm" variant="ghost" onClick={signOut} className="w-full">
                Sign out
              </Button>
            ) : (
              <>
                <Link to="/auth/login" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">Sign in</Button>
                </Link>
                <Link to="/auth/signup" className="flex-1">
                  <Button size="sm" className="w-full">Join</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}