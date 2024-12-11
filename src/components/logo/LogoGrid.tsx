'use client'

import React from "react"
import { LogoCard } from "./LogoCard"
import type { Logo } from "../../lib/types"

interface LogoGridProps {
  logos: Logo[];
  onLogoClick: (id: string) => void;
}

export const LogoGrid = ({ logos, onLogoClick }: LogoGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {logos.map((logo) => (
        <LogoCard
          key={logo.id}
          {...logo}
          onClick={() => onLogoClick(logo.id)}
        />
      ))}
    </div>
  );
}; 