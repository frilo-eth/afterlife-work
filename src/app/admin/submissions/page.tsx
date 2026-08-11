import { redirect } from 'next/navigation'

/** Legacy submissions list. Public submit now creates Logo rows in REVIEW. */
export default function SubmissionsPage() {
  redirect('/admin/logos?status=REVIEW')
}
