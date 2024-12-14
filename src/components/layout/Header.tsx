'use client'

import React from "react"
import { Button, Link } from "@nextui-org/react"
import NextLink from 'next/link'

export const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10">
    <div className="container mx-auto px-4">
      <div className="h-16 flex items-center justify-between">
        <NextLink href="/" passHref legacyBehavior>
          <Link className="font-mono text-lg">
            Graveyard
          </Link>
        </NextLink>
        
        <nav className="flex items-center gap-6">
          <NextLink href="#collection" passHref legacyBehavior>
            <Link className="text-sm text-white/70 hover:text-white">
              Collection
            </Link>
          </NextLink>
          <NextLink href="#pricing" passHref legacyBehavior>
            <Link className="text-sm text-white/70 hover:text-white">
              Pricing
            </Link>
          </NextLink>
          <Button 
            as={NextLink}
            href="/upload"
            variant="bordered" 
            size="sm"
            className="font-mono"
          >
            Submit Logo
          </Button>
        </nav>
      </div>
    </div>
  </header>
); 