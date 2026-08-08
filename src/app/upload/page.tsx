'use client'

import { UploadForm } from "@/components/upload/UploadForm"
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()

  const handleSuccess = (logoId: string) => {
    router.push(`/${logoId}`)
  }

  return (
    <main className="pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Submit Logo</h1>
        <UploadForm onSuccess={handleSuccess} />
      </div>
    </main>
  )
} 