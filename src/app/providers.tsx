'use client'

import { NextUIProvider } from '@nextui-org/react'
import { ShapeProvider } from '@/lib/shape-context'
import { SizeProvider } from '@/lib/size-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      {/*
        Fluid shape + size. Rounded (not pill) is the product default —
        https://www.fluidfunctionalism.com — and density stays at the default
        36px step unless a region opts into compact.
      */}
      <ShapeProvider defaultShape="rounded">
        <SizeProvider defaultSize="default">{children}</SizeProvider>
      </ShapeProvider>
    </NextUIProvider>
  )
}
