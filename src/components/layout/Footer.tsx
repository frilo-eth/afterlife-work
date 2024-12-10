'use client'

import React from "react"
import { Link } from "@nextui-org/react"

export const Footer = () => (
  <footer className="border-t border-white/10 py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-mono text-sm mb-4">About</h4>
          <p className="text-sm text-white/60">
            Where rejected logos find new life. Each design tells a story of what could have been—and what still could be.
          </p>
        </div>
        
        <div>
          <h4 className="font-mono text-sm mb-4">Links</h4>
          <div className="space-y-2">
            <Link href="#" className="block text-sm text-white/60 hover:text-white">
              Collection
            </Link>
            <Link href="#" className="block text-sm text-white/60 hover:text-white">
              Submit Logo
            </Link>
            <Link href="#" className="block text-sm text-white/60 hover:text-white">
              Pricing
            </Link>
          </div>
        </div>
        
        <div>
          <h4 className="font-mono text-sm mb-4">Contact</h4>
          <div className="space-y-2">
            <Link href="mailto:hello@graveyard.design" className="block text-sm text-white/60 hover:text-white">
              hello@graveyard.design
            </Link>
          </div>
        </div>
      </div>
    </div>
  </footer>
); 