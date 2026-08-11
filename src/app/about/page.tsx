import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Logos get shelved when projects stall. Afterlife puts finished marks back in play for founders who need one now.',
}

/** Deep links and bookmarks open the about modal on the homepage. */
export default function AboutPage() {
  redirect('/?about=1')
}
