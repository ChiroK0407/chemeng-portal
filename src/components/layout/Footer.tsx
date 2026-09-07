import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { APP_NAME } from '@/utils/constants'

const LINKS = [
  {
    title: 'Explore',
    links: [
      ['PSU Explorer',   '/psu'],
      ['Projects',       '/projects'],
      ['Opportunities',  '/opportunities'],
      ['Resources',      '/resources'],
    ],
  },
  {
    title: 'Community',
    links: [
      ['Members', '/members'],
      ['Events',  '/events'],
      ['Blogs',   '/blogs'],
    ],
  },
  {
    title: 'Account',
    links: [
      ['Sign Up',    '/auth/signup'],
      ['Login',      '/auth/login'],
      ['Dashboard',  '/dashboard'],
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="bg-surface-50 border-t border-surface-200 dark:bg-surface-900 dark:border-surface-800 mt-24">
      <div className="container-page py-12 grid grid-cols-2 md:grid-cols-4 gap-8">

        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg mb-4">
            <FlaskConical className="w-5 h-5 text-primary-600" />
            <span className="text-gradient">{APP_NAME}</span>
          </Link>
          <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
            The engineering community for ChemE students, researchers, and professionals.
          </p>
        </div>

        {LINKS.map(col => (
          <div key={col.title}>
            <h4 className="font-semibold text-sm text-surface-900 dark:text-surface-100 mb-3">
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-sm text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-page py-4 border-t border-surface-200 dark:border-surface-800 flex justify-between items-center">
        <p className="text-xs text-surface-400">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-surface-400">
          <a href="#" className="hover:text-primary-600 transition-colors">GitHub</a>
          <a href="#" className="hover:text-primary-600 transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}