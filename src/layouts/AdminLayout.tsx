import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <Outlet />
      </main>
    </div>
  )
}