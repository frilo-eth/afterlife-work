'use client'

import React from "react"
import {NextUIProvider} from "@nextui-org/react"
import {useRouter} from 'next/navigation'

export function Providers({children}: { children: React.ReactNode }) {
  const router = useRouter()
  
  return (
    <NextUIProvider navigate={router.push}>
      {children}
    </NextUIProvider>
  )
} 