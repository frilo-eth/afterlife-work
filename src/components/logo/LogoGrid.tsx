'use client'

import React from "react"
import { LogoCard } from "./LogoCard"
import type { Logo } from "@/types"

interface LogoGridProps {
  logos: Logo[];
  onLogoPress?: (id: string) => void;
}

export function LogoGrid({ logos, onLogoPress }: LogoGridProps) {
  if (!logos || !Array.isArray(logos)) {
    console.error('Invalid logos data:', logos)
    return <div>No logos available</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {logos.map((logo) => (
        <LogoCard
          key={logo.id}
          {...logo}
          onPress={() => onLogoPress?.(logo.id)}
        />
      ))}
    </div>
  );
} 