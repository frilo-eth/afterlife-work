'use client'

import React from "react"
import { LogoCard } from "./LogoCard"
import type { Logo } from "../../lib/types"

interface LogoGridProps {
  logos: Logo[];
  onLogoPress: (id: string) => void;
}

export const LogoGrid = ({ logos, onLogoPress }: LogoGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {logos.map((logo) => (
        <LogoCard
          key={logo.id}
          {...logo}
          onPress={() => onLogoPress(logo.id)}
        />
      ))}
    </div>
  );
}; 