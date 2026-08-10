import { Spinner } from '@/components/ui/spinner'

export default function Loading() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8" label="Loading logos" />
    </div>
  )
}
