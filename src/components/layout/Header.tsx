'use client'

import React from "react"
import { Button, Link } from "@nextui-org/react"
import Image from "next/image"

export const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10">
    <div className="container mx-auto px-4">
      <div className="h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.svg" 
            alt="Afterlife" 
            width={32} 
            height={32}
            className="w-8 h-8"
          />
          <span className="font-mono text-lg">Afterlife</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="#collection" className="text-sm text-white/70 hover:text-white">
            Collection
          </Link>
          <Link href="#pricing" className="text-sm text-white/70 hover:text-white">
            Pricing
          </Link>
        </nav>
      </div>
    </div>
  </header>
) 