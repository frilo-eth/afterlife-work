'use client'

import React from "react"
import { LogoCard } from "./LogoCard"

// Only the fields the card actually renders. Kept structural so both the
// public catalog's trimmed rows and the admin's full Logo records satisfy it.
interface LogoGridItem {
  id: string;
  title: string;
  thumbnail: string;
  tags: string[];
}

interface LogoGridProps {
  logos: LogoGridItem[];
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