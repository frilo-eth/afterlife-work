import type { Metadata } from 'next'
import { AboutContent } from './AboutContent'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Logos get shelved when projects stall. Afterlife puts finished marks back in play for founders who need one now.',
}

export default function AboutPage() {
  return <AboutContent />
}
