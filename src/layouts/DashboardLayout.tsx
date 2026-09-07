import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Navbar />
      <div className="flex pt-16">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  )
}