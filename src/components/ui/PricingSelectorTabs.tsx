'use client'

import React from "react"
import { Tabs, Tab, Card, CardBody, Button, Switch, Input, Tooltip } from "@nextui-org/react"
import { motion, AnimatePresence } from "framer-motion"
import { BookCallModal } from "@/components/modals/BookCallModal"
import { Info } from "lucide-react"

type TierType = 'summon' | 'revival' | 'afterlife'

interface PricingSelectorTabsProps {
  price: {
    summon: number
    revival: number
    afterlife: string
  }
  // Only the identity is needed here; the component renders nothing else from
  // the logo. Kept narrow so callers are not forced to build a full record.
  logo: { id: string }
  onSelect: (tier: TierType, options?: {
    wordmark?: string
    domain?: string
  }) => void
}

export const PricingSelectorTabs = ({ price, logo, onSelect }: PricingSelectorTabsProps) => {
  console.log('Component rendered with props:', { price, logo }) // Debug initial render

  const [selectedTier, setSelectedTier] = React.useState<TierType>("revival")
  const [withWordmark, setWithWordmark] = React.useState(false)
  const [wordmarkText, setWordmarkText] = React.useState("")
  const [isCallModalOpen, setIsCallModalOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [orderSummary, setOrderSummary] = React.useState({
    base: 0,
    wordmark: 0,
    total: 0
  })

  // Debug state changes
  React.useEffect(() => {
    console.log('State changed:', {
      selectedTier,
      withWordmark,
      wordmarkText,
      isCallModalOpen
    })
  }, [selectedTier, withWordmark, wordmarkText, isCallModalOpen])

  React.useEffect(() => {
    const base = selectedTier === 'summon' ? price.summon : 
                 selectedTier === 'revival' ? price.revival : 0
    const wordmarkCost = withWordmark ? 1500 : 0

    setOrderSummary({
      base,
      wordmark: wordmarkCost,
      total: base + wordmarkCost
    })
  }, [selectedTier, withWordmark, price])

  const handlePurchase = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent any default behavior
    console.log('1. Button clicked') // Debug click

    try {
      console.log('2. Current state:', {
        selectedTier,
        withWordmark,
        wordmarkText,
        orderSummary
      })

      if (!selectedTier) {
        console.error('No tier selected')
        return
      }

      if (selectedTier === 'afterlife') {
        console.log('3a. Opening modal')
        setIsCallModalOpen(true)
        return
      }

      console.log('3b. Preparing purchase options')
      const options = {
        ...(withWordmark && wordmarkText && { wordmark: wordmarkText })
      }

      console.log('4. Calling onSelect with:', {
        tier: selectedTier,
        options
      })

      // Check if onSelect is a function
      if (typeof onSelect !== 'function') {
        throw new Error(`onSelect is not a function, got ${typeof onSelect}`)
      }

      onSelect(selectedTier, options)
      console.log('5. onSelect called successfully')

    } catch (error) {
      console.error('ERROR in handlePurchase:', error)
      console.error('Full error details:', {
        error,
        stack: error instanceof Error ? error.stack : 'No stack trace',
        state: {
          selectedTier,
          withWordmark,
          wordmarkText,
          orderSummary
        }
      })
    }
  }

  // Debug render
  console.log('Rendering with:', {
    selectedTier,
    withWordmark,
    wordmarkText,
    isCallModalOpen
  })

  return (
    <>
      <Card className="bg-zinc-900/50 backdrop-blur-sm border border-white/10">
        <CardBody className="p-6 space-y-6">
          <Tabs 
            selectedKey={selectedTier}
            onSelectionChange={(key) => setSelectedTier(key as TierType)}
            variant="underlined"
            classNames={{
              tabList: "w-full relative rounded-none p-0 border-b border-white/20",
              cursor: "w-full bg-white",
              tab: "flex-1 h-12",
              tabContent: "w-full group-data-[selected=true]:text-white"
            }}
          >
            <Tab 
              key="summon" 
              title={
                <span className="font-mono text-sm tracking-wider">SUMMON</span>
              }
            >
              <div className="mt-4 space-y-6">
                <div>
                  <span className="font-mono text-xs tracking-wider opacity-50 uppercase block mb-2">BASIC PACKAGE</span>
                  <p className="text-sm text-white/60 mb-3">Essential files. Instant Delivery.</p>
                  <span className="text-3xl font-bold">$1,000</span>
                </div>
                
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-2"
                >
                  <li className="text-sm text-white/60">• Exclusive use licence</li>
                  <li className="text-sm text-white/60">• Basic editable formats (.ai, .pdf, .svg)</li>
                </motion.ul>
              </div>
            </Tab>

            <Tab 
              key="revival" 
              title={
                <div className="flex items-center gap-2 justify-center">
                  <span className="font-mono text-sm tracking-wider">REVIVAL</span>
                  <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">
                    BEST
                  </span>
                </div>
              }
            >
              <div className="mt-4 space-y-6">
                <div>
                  <span className="font-mono text-xs tracking-wider opacity-50 uppercase block mb-2">ADVANCED BRAND PACKAGE</span>
                  <p className="text-sm text-white/60 mb-3">
                    Full editable files. Delivery in {withWordmark ? '5-7 work days' : '2-3 days'}
                  </p>
                  <span className="text-3xl font-bold">$5,000</span>
                </div>
                
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-2"
                >
                  <li className="text-sm text-white/60">• Exclusive use licence</li>
                  <li className="text-sm text-white/60">• Complete editable formats (.ai, .pdf, .svg, .eps)</li>
                  <li className="text-sm text-white/60">• Figma Files</li>
                  <li className="text-sm text-white/60">• Typography Licence Recommendation</li>
                </motion.ul>
              </div>
            </Tab>

            <Tab 
              key="afterlife" 
              title={
                <span className="font-mono text-sm tracking-wider">AFTERLIFE</span>
              }
            >
              <div className="mt-4 space-y-6">
                <div>
                  <span className="font-mono text-xs tracking-wider opacity-50 uppercase block mb-2">CUSTOM BRANDING EXPERIENCE</span>
                  <p className="text-sm text-white/60 mb-3">Bespoke brand development. 2 weeks sprint.</p>
                  <span className="text-3xl font-bold">From $10,000</span>
                </div>
                
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-2"
                >
                  <li className="text-sm text-white/60">• Personalized Session</li>
                  <li className="text-sm text-white/60">• Custom Applications</li>
                  <li className="text-sm text-white/60">• Full Brand Strategy</li>
                  <li className="text-sm text-white/60">• Frequent updates</li>
                  <li className="text-sm text-white/60 flex items-center gap-1">
                    • Renewable white gloves service 
                    <Tooltip 
                      content={
                        <div className="p-2">
                          <p>$10,000 Monthly Retainer afterwards</p>
                          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">50% Off</span>
                        </div>
                      }
                    >
                      <Info className="w-4 h-4 opacity-60" />
                    </Tooltip>
                  </li>
                </motion.ul>
              </div>
            </Tab>
          </Tabs>

          {selectedTier !== 'afterlife' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">Add Wordmark (+$1,500)</p>
                <Switch 
                  size="sm"
                  isSelected={withWordmark}
                  onValueChange={setWithWordmark}
                  classNames={{
                    wrapper: "group-data-[selected=true]:bg-white",
                    thumb: "group-data-[selected=true]:bg-black"
                  }}
                />
              </div>
              
              {withWordmark && (
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={wordmarkText}
                    onValueChange={setWordmarkText}
                    placeholder="Insert brand name"
                    classNames={{
                      input: "bg-zinc-900/50 text-white border-white/10"
                    }}
                  />
                  <p className="text-xs text-white/60">
                    We&apos;ll design a custom wordmark to match your logo. Delivery within 48 hours.
                  </p>
                </div>
              )}

              <motion.div
                key={`summary-${orderSummary.total}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-mono text-sm tracking-wider opacity-50 uppercase block mb-4">
                  Order Summary
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Price</span>
                    <span>${orderSummary.base.toLocaleString()}</span>
                  </div>
                  {withWordmark && (
                    <div className="flex justify-between text-sm">
                      <span>Wordmark Design</span>
                      <span>${orderSummary.wordmark.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>${orderSummary.total.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <Button 
            className="w-full bg-white text-black hover:bg-white/90"
            onClick={(e) => {
              console.log('Button onClick triggered') // Debug button click
              handlePurchase(e)
            }}
          >
            {selectedTier === 'afterlife' ? 'Book a Call' : 'Buy Now'}
          </Button>
        </CardBody>
      </Card>

      <BookCallModal 
        isOpen={isCallModalOpen} 
        onClose={() => {
          console.log('Modal closing') // Debug modal
          setIsCallModalOpen(false)
        }} 
      />
    </>
  )
} 