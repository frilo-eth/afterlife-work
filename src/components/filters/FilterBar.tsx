'use client'

import React from "react"
import { Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react"
import { Search } from "lucide-react"
import { LOGO_TAGS, INDUSTRIES, PRICE_RANGES } from "../../lib/constants"

export const FilterBar = () => {
  return (
    <div className="sticky top-16 z-10 backdrop-blur-md border-b border-white/10 bg-black/50 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          <Input
            type="search"
            placeholder="Search logos..."
            startContent={<Search className="w-4 h-4 text-white/50" />}
            classNames={{
              base: "max-w-xs",
              input: "text-sm",
              inputWrapper: "bg-white/5 border-white/10"
            }}
          />
          
          <div className="flex gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="bordered" 
                  className="border-white/10"
                >
                  Style
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Style filters"
                className="bg-zinc-900/90 backdrop-blur-md"
              >
                {LOGO_TAGS.map((tag) => (
                  <DropdownItem key={tag.toString()}>
                    {tag}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="bordered" 
                  className="border-white/10"
                >
                  Industry
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Industry filters"
                className="bg-zinc-900/90 backdrop-blur-md"
              >
                {INDUSTRIES.map((industry) => (
                  <DropdownItem key={industry.toString()}>
                    {industry}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="bordered" 
                  className="border-white/10"
                >
                  Price
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Price filters"
                className="bg-zinc-900/90 backdrop-blur-md"
              >
                {PRICE_RANGES.map((range) => (
                  <DropdownItem key={range.toString()}>
                    {range}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  )
} 