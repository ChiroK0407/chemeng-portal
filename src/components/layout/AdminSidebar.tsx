import { Link, NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, FolderOpen, BookOpen, Calendar, Briefcase, Users, Mail, FlaskConical } from 'lucide-react'
import { cn } from '@/utils/cn'

const LINKS = [
  { href: '/admin',                icon: LayoutDashboard, label: 'Dashboard',       end: true  },
  { href: '/admin/psus',           icon: Building2,       label: 'PSUs',            end: false },
  { href: '/admin/projects',       icon: FolderOpen,      label: 'Projects',        end: false },
  { href: '/admin/blogs',          icon: BookOpen,        label: 'Blogs',           end: false },
  { href: '/admin/events',         icon: Calendar,        label: 'Events',          end: false },
  { href: '/admin/opportunities',  icon: Briefcase,       label: 'Opportunities',   end: false },
  { href: '/admin/users',          icon: Users,           label: 'Users',           end: false },
  { href: '/admin/email',          icon: Mail,            label: 'Email Campaigns', end: false },
]

export function AdminSidebar() {
  return (
    <aside className="fixed left-0 inset-y-0 w-64 bg-surface-900 dark:bg-surface-950 border-r border-surface-800 hidden lg:flex flex-col">
      <div className="p-4 border-b border-surface-800">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-white">
          <FlaskConical className="w-5 h-5 text-primary-400" />
          <span>Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {LINKS.map(({ href, icon: Icon, label, end }) => (
          <NavLink
            key={href}
            to={href}
            end={end}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-600 text-white'
                : 'text-surface-400 hover:bg-surface-800 hover:text-surface-100'
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