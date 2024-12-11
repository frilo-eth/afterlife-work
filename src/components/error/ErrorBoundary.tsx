'use client'

import React from "react"
import { Button } from "@nextui-org/react"
import { RefreshCcw } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <Button
            onClick={() => window.location.reload()}
            startContent={<RefreshCcw className="w-4 h-4" />}
          >
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
} 