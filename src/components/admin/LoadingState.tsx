import { Spinner, Card } from '@nextui-org/react'

export function LoadingState() {
  return (
    <Card className="w-full h-[300px] flex items-center justify-center bg-default-50">
      <Spinner size="lg" color="white" />
    </Card>
  )
} 