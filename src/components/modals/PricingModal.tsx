'use client'

import React from "react"
import { Modal, ModalContent, Button, Tooltip } from "@nextui-org/react"
import { X, Info } from "lucide-react"

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PricingModal = ({ isOpen, onClose }: PricingModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="full"
      hideCloseButton
      classNames={{
        base: "bg-background/95 backdrop-blur-xl h-[100dvh] m-0 fixed inset-0 z-[100]",
        wrapper: "p-0 h-[100dvh] m-0",
        backdrop: "opacity-100",
        body: "p-0 h-full"
      }}
    >
      <ModalContent>
        <div className="relative h-[100dvh] overflow-y-auto">
          {/* Close button */}
          <Button
            isIconOnly
            className="fixed right-4 top-4 z-[101] bg-background/20 backdrop-blur-sm border border-border hover:bg-accent"
            size="sm"
            onPress={onClose}
          >
            <X size={18} />
          </Button>

          <div className="container mx-auto px-4 py-24">
            {/* Header */}
            <div className="space-y-4 text-center mb-16">
              <span className="font-mono text-sm tracking-wider opacity-50 uppercase block">
                Pricing Plans
              </span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Choose your resurrection plan
              </h2>
              <p className="text-sm text-foreground-muted max-w-xl mx-auto">
                From basic revival to complete rebirth, select the journey that fits your vision
              </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Summon Tier */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8 rounded-xl bg-background/20 backdrop-blur-sm border border-border hover:border-border-strong transition-colors h-full">
                  <span className="font-mono text-sm tracking-wider opacity-50 uppercase block mb-4">
                    Summon
                  </span>
                  <div className="mb-8">
                    <div className="text-3xl font-bold">$1,000</div>
                    <p className="text-sm text-foreground-muted mt-2">Essential files. Instant Delivery.</p>
                  </div>
                  <ul className="space-y-4">
                    <li className="text-sm text-foreground-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-foreground/60 rounded-full" />
                      Exclusive use licence
                    </li>
                    <li className="text-sm text-foreground-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-foreground/60 rounded-full" />
                      Basic editable formats (.ai, .pdf, .svg)
                    </li>
                  </ul>
                </div>
              </div>

              {/* Revival Tier */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8 rounded-xl bg-background/30 backdrop-blur-sm border-2 border-border-strong hover:border-border-strong transition-colors h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-sm tracking-wider opacity-50 uppercase block">
                      Revival
                    </span>
                    <span className="bg-accent text-foreground text-xs px-3 py-1 rounded-full">
                      POPULAR
                    </span>
                  </div>
                  <div className="mb-8">
                    <div className="text-3xl font-bold">$5,000</div>
                    <p className="text-sm text-foreground-muted mt-2">Full editable files. Delivery in 2-3 days.</p>
                  </div>
                  <ul className="space-y-4">
                    <li className="text-sm text-foreground-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-foreground/60 rounded-full" />
                      Exclusive use licence
                    </li>
                    <li className="text-sm text-foreground-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-foreground/60 rounded-full" />
                      Complete editable formats (.ai, .pdf, .svg, .eps)
                    </li>
                    <li className="text-sm text-foreground-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-foreground/60 rounded-full" />
                      Figma Files
                    </li>
                    <li className="text-sm text-foreground-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-foreground/60 rounded-full" />
                      Typography Licence Recommendation
                    </li>
                  </ul>
                </div>
              </div>

              {/* Afterlife Tier */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8 rounded-xl bg-background/20 backdrop-blur-sm border border-border hover:border-border-strong transition-colors h-full">
                  <span className="font-mono text-sm tracking-wider opacity-50 uppercase block mb-4">
                    Afterlife
                  </span>
                  <div className="mb-8">
                    <div className="text-3xl font-bold">From $10,000</div>
                    <p className="text-sm text-foreground-muted mt-2">Bespoke brand development. 2 weeks sprint.</p>
                  </div>
                  <ul className="space-y-4">
                    <li className="text-sm text-foreground-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-foreground/60 rounded-full" />
                      Personalized Session
                    </li>
                    <li className="text-sm text-foreground-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-foreground/60 rounded-full" />
                      Custom Applications
                    </li>
                    <li className="text-sm text-foreground-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-foreground/60 rounded-full" />
                      Full Brand Strategy
                    </li>
                    <li className="text-sm text-foreground-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-foreground/60 rounded-full" />
                      Frequent updates
                    </li>
                    <li className="text-sm text-foreground-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-foreground/60 rounded-full" />
                      Renewable white gloves service
                      <Tooltip 
                        content={
                          <div className="p-2">
                            <p>$10,000 Monthly Retainer afterwards</p>
                            <span className="bg-accent text-xs px-2 py-0.5 rounded-full">50% Off</span>
                          </div>
                        }
                      >
                        <Info className="w-4 h-4 opacity-60" />
                      </Tooltip>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Back Home Button */}
            <div className="text-center mt-16">
              <Button
                className="bg-background/20 backdrop-blur-sm border border-border hover:bg-accent text-foreground"
                size="lg"
                onPress={onClose}
              >
                Back Home
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
} 