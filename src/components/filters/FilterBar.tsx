'use client'

import React, { useState } from "react"
import { Input, Button } from "@nextui-org/react"
import { Search, SlidersHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FilterBarProps {
  onSearch: (query: string) => void;
}

export const FilterBar = ({ onSearch }: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="sticky top-16 z-10 backdrop-blur-md border-b border-white/10 bg-black/50">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Search"
            startContent={<Search className="w-4 h-4 text-white/50" />}
            onChange={(e) => onSearch(e.target.value)}
            classNames={{
              base: "flex-1",
              input: "text-sm",
              inputWrapper: "bg-white/5 border-white/10"
            }}
          />
          <Button
            isIconOnly
            variant="flat"
            className="bg-white/5"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                {/* Additional filters can go here */}
                <div className="flex flex-wrap gap-2">
                  {["Recent", "Popular", "Price: Low to High", "Price: High to Low"].map((filter) => (
                    <Button
                      key={filter}
                      size="sm"
                      variant="flat"
                      className="bg-white/5"
                    >
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 