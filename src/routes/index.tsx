import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { PageSpinner } from '@/components/ui/Spinner'

// Layouts
import PublicLayout    from '@/layouts/PublicLayout'
import DashboardLayout from '@/layouts/DashboardLayout'

// Public pages
const HomePage          = lazy(() => import('@/pages/HomePage'))
const PSUListPage       = lazy(() => import('@/pages/psu/PSUListPage'))
const PSUDetailPage     = lazy(() => import('@/pages/psu/PSUDetailPage'))
const ProjectListPage   = lazy(() => import('@/pages/projects/ProjectListPage'))
const ProjectDetailPage = lazy(() => import('@/pages/projects/ProjectDetailPage'))
const BlogListPage      = lazy(() => import('@/pages/blogs/BlogListPage'))
const BlogDetailPage    = lazy(() => import('@/pages/blogs/BlogDetailPage'))
const MemberListPage    = lazy(() => import('@/pages/members/MemberListPage'))
const MemberDetailPage  = lazy(() => import('@/pages/members/MemberDetailPage'))
const OpportunitiesPage = lazy(() => import('@/pages/opportunities/OpportunitiesPage'))
const EventsPage        = lazy(() => import('@/pages/events/EventsPage'))
const EventDetailPage   = lazy(() => import('@/pages/events/EventDetailPage'))
const ResourcesPage     = lazy(() => import('@/pages/resources/ResourcesPage'))

// Auth pages
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'))
const SignupPage          = lazy(() => import('@/pages/auth/SignupPage'))
const ForgotPasswordPage  = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage   = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const AuthCallbackPage    = lazy(() => import('@/pages/auth/AuthCallbackPage'))

// Dashboard pages
const DashboardPage     = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ProfilePage       = lazy(() => import('@/pages/dashboard/ProfilePage'))
const SavedItemsPage    = lazy(() => import('@/pages/dashboard/SavedItemsPage'))
const NotificationsPage = lazy(() => import('@/pages/dashboard/NotificationsPage'))

// Admin — single hidden content-editor page, password-gated internally
// (see useAdminAuth) rather than via the router, since there's no per-user
// login system at this stage.
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'))

// 404
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// ── Route guards ──────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <PageSpinner />
  if (!user)     return <Navigate to="/auth/login" replace />
  return <>{children}</>
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>
}

// ── Router ────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Public
  {
    element: <PublicLayout />,
    children: [
      { path: '/',               element: <S><HomePage /></S> },
      { path: '/psu',            element: <S><PSUListPage /></S> },
      { path: '/psu/:slug',      element: <S><PSUDetailPage /></S> },
      { path: '/projects',       element: <S><ProjectListPage /></S> },
      { path: '/projects/:slug', element: <S><ProjectDetailPage /></S> },
      { path: '/blogs',          element: <S><BlogListPage /></S> },
      { path: '/blogs/:slug',    element: <S><BlogDetailPage /></S> },
      { path: '/members',        element: <S><MemberListPage /></S> },
      { path: '/members/:id',    element: <S><MemberDetailPage /></S> },
      { path: '/opportunities',  element: <S><OpportunitiesPage /></S> },
      { path: '/events',         element: <S><EventsPage /></S> },
      { path: '/events/:slug',   element: <S><EventDetailPage /></S> },
      { path: '/resources',      element: <S><ResourcesPage /></S> },
    ],
  },
  // Auth
  { path: '/auth/login',            element: <S><LoginPage /></S> },
  { path: '/auth/signup',           element: <S><SignupPage /></S> },
  { path: '/auth/forgot-password',  element: <S><ForgotPasswordPage /></S> },
  { path: '/auth/reset-password',   element: <S><ResetPasswordPage /></S> },
  { path: '/auth/callback',         element: <S><AuthCallbackPage /></S> },
  // Dashboard
  {
    element: <RequireAuth><DashboardLayout /></RequireAuth>,
    children: [
      { path: '/dashboard',                   element: <S><DashboardPage /></S> },
      { path: '/dashboard/profile',           element: <S><ProfilePage /></S> },
      { path: '/dashboard/saved',             element: <S><SavedItemsPage /></S> },
      { path: '/dashboard/notifications',     element: <S><NotificationsPage /></S> },
    ],
  },
  // Admin — one hidden page, not linked from any nav. Its own password
  // gate (useAdminAuth) protects it, so no router-level guard is needed.
  { path: '/admin', element: <S><AdminPage /></S> },
  // 404
  { path: '*', element: <S><NotFoundPage /></S> },
])