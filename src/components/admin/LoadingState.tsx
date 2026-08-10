import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export function LoadingState() {
  return (
    <Card className="flex h-[300px] w-full items-center justify-center">
      <Spinner className="h-8 w-8" label="Loading dashboard data" />
    </Card>
  )
}
