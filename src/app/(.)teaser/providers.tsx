'use client'

import { NextUIProvider } from '@nextui-org/react'

export function Providers({ children }: { children: React.ReactNode }) {
  // Simplified provider without the LoadingScreen
  return <NextUIProvider>{children}</NextUIProvider>
} 