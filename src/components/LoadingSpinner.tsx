import { Spinner } from "@nextui-org/react"

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner color="white" />
    </div>
  )
}