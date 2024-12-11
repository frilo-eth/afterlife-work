'use client'

import React from "react"
import { LogoCard } from "./LogoCard"
import { motion } from "framer-motion"
import type { Logo } from "@/lib/types"

interface LogoGridProps {
  logos: Logo[];
  onLogoClick: (id: string) => void;
}

export const LogoGrid = ({ logos, onLogoClick }: LogoGridProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {logos.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-white/60">No logos found</p>
        </div>
      ) : (
        logos.map((logo) => (
          <LogoCard
            key={logo.id}
            {...logo}
            onClick={() => onLogoClick(logo.id)}
          />
        ))
      )}
    </motion.div>
  );
}; 