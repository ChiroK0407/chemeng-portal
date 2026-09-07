import { NavLink } from 'react-router-dom'
import { LayoutDashboard, User, Bookmark, Bell } from 'lucide-react'
import { cn } from '@/utils/cn'

const LINKS = [
  { href: '/dashboard',                icon: LayoutDashboard, label: 'Overview',      end: true  },
  { href: '/dashboard/profile',        icon: User,            label: 'Profile',       end: false },
  { href: '/dashboard/saved',          icon: Bookmark,        label: 'Saved Items',   end: false },
  { href: '/dashboard/notifications',  icon: Bell,            label: 'Notifications', end: false },
]

export function DashboardSidebar() {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-surface-200 dark:bg-surface-950 dark:border-surface-800 hidden lg:block overflow-y-auto">
      <nav className="p-4 space-y-1">
        {LINKS.map(({ href, icon: Icon, label, end }) => (
          <NavLink
            key={href}
            to={href}
            end={end}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}