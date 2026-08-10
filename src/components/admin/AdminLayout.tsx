import type { ReactNode } from 'react'
import Link from 'next/link'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link 
                href="/admin" 
                className="flex items-center px-2 py-2 text-gray-900"
              >
                Dashboard
              </Link>
              <Link 
                href="/admin/logos" 
                className="flex items-center px-2 py-2 text-gray-900"
              >
                Logos
              </Link>
              <Link 
                href="/admin/settings" 
                className="flex items-center px-2 py-2 text-gray-900"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
} 