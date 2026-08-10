import { redirect } from 'next/navigation'

export default function NewLogoPage() {
  // Redirect to the main logos page
  redirect('/admin/logos')
}
