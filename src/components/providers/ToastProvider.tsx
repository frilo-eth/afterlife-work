'use client'

import React from 'react'
import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster 
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }}
    />
  )
} 