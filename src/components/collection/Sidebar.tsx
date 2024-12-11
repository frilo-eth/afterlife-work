'use client'

import React from "react"
import { ScrollShadow } from "@nextui-org/react"
import { INDUSTRIES, LOGO_TAGS } from "@/lib/constants"

interface SidebarProps {
  className?: string;
  activeCategory?: string;
  activeIndustry?: string;
  activeStyle?: string;
  onCategoryChange: (category: string) => void;
  onIndustryChange: (industry: string) => void;
  onStyleChange: (style: string) => void;
}

export const Sidebar = ({ 
  className = "",
  activeCategory,
  activeIndustry,
  activeStyle,
  onCategoryChange,
  onIndustryChange,
  onStyleChange
}: SidebarProps) => {
  const categories = ["All", "Recent", "Popular"]

  return (
    <ScrollShadow className={`bg-black/50 backdrop-blur-xl p-4 ${className}`}>
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="font-mono text-sm mb-3 text-white/50">Categories</h3>
          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg 
                  ${activeCategory === category 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/70 hover:bg-white/5'
                  }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>

        {/* Industries */}
        <div>
          <h3 className="font-mono text-sm mb-3 text-white/50">Industries</h3>
          <nav className="space-y-1">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry}
                onClick={() => onIndustryChange(industry)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg 
                  ${activeIndustry === industry 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/70 hover:bg-white/5'
                  }`}
              >
                {industry}
              </button>
            ))}
          </nav>
        </div>

        {/* Styles */}
        <div>
          <h3 className="font-mono text-sm mb-3 text-white/50">Styles</h3>
          <nav className="space-y-1">
            {LOGO_TAGS.map((style) => (
              <button
                key={style}
                onClick={() => onStyleChange(style)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg 
                  ${activeStyle === style 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/70 hover:bg-white/5'
                  }`}
              >
                {style}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </ScrollShadow>
  )
} 