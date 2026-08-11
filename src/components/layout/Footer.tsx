'use client'

import { Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FriloPill } from '@/components/layout/FriloPill'
import { AboutModal } from '@/components/modals/AboutModal'
import { SubmitLogoModal } from '@/components/modals/SubmitLogoModal'
import { Button } from '@/components/ui/button'

const linkClass =
  'text-caption text-foreground-subtle transition-colors duration-80 hover:text-foreground'

/** Lucide's Twitter bird is retired; keep a simple X glyph for the profile link. */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function clearAboutQuery() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('about')) return
  url.searchParams.delete('about')
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', next)
}

export const Footer = () => {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const year = new Date().getFullYear()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('about') === '1') {
      setIsAboutOpen(true)
    }
  }, [])

  const closeAbout = () => {
    setIsAboutOpen(false)
    clearAboutQuery()
  }

  return (
    <>
      <footer className="border-t border-border">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-1.5 text-caption text-foreground-subtle">
            © {year} Afterlife. Made with soul by
            <FriloPill />
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
              <button type="button" className={linkClass} onClick={() => setIsAboutOpen(true)}>
                About
              </button>
              <button type="button" className={linkClass} onClick={() => setIsSubmitOpen(true)}>
                Submit
              </button>
            </nav>

            <div className="flex items-center gap-1">
              <Button asChild variant="ghost" size="icon-sm">
                <a href="mailto:hi@afterlife.work" aria-label="Email">
                  <Mail className="h-3.5 w-3.5" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon-sm">
                <a
                  href="https://x.com/afterlifewrk"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Afterlife on X"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <AboutModal isOpen={isAboutOpen} onClose={closeAbout} />
      <SubmitLogoModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </>
  )
}
