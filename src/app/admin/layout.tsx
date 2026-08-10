'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { AdminNav } from '@/components/AdminNav'
import { cn } from '@/lib/utils'

// These navigate between routes, so they are links. They were previously a
// tab control, which announces as a tablist and implies in-page panels that
// do not exist.
const SECTIONS = [
  { key: 'logos', label: 'Logos', href: '/admin/logos' },
  { key: 'submissions', label: 'Submissions', href: '/admin/submissions' },
  { key: 'orders', label: 'Orders', href: '/admin/orders' },
  { key: 'designers', label: 'Designers', href: '/admin/designers' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const currentSection = pathname.split('/')[2] || 'logos'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav />

      <main className="container relative mx-auto px-6 pt-24">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <nav aria-label="Admin sections" className="relative z-10 mb-6 border-b border-border">
          <ul className="flex gap-1">
            {SECTIONS.map((section) => {
              const isCurrent = currentSection === section.key
              return (
                <li key={section.key}>
                  <Link
                    href={section.href}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-10 items-center border-b-2 px-4 text-sm',
                      'transition-[color,border-color,font-weight] duration-quick ease-settle',
                      isCurrent
                        ? 'border-foreground font-semibold text-foreground'
                        : 'border-transparent font-medium text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {section.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="relative z-10 mt-6">{children}</div>
      </main>
    </div>
  )
}
