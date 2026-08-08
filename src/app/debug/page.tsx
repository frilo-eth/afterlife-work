import { StripeDebug } from '@/components/debug/StripeDebug'

export default function DebugPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Tools</h1>
      <StripeDebug />
    </div>
  )
} 