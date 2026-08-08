import { Spinner } from '@nextui-org/react'

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-[50vh]">
      <Spinner size="lg" label="Loading logos..." />
    </div>
  )
} 