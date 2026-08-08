'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Image, 
  ShoppingCart, 
  BarChart, 
  Settings, 
  Mail 
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Logos', href: '/admin/logos', icon: Image },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Email Preview', href: '/admin/email-preview', icon: Mail },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-black text-white border-r border-gray-800 z-50">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="mt-6">
        <div className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${isActive 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
} 