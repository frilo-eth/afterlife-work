'use client'

import React from "react"
import { Card, CardBody, RadioGroup, Radio, Button, Switch, Input, Tooltip } from "@nextui-org/react"
import type { Logo } from '@/lib/types'
import { PriceDisplay } from './PriceDisplay'
import { PRICE_TIERS } from '@/lib/price-constants'
import { motion, AnimatePresence } from "framer-motion"

interface PricingSelectorProps {
  price: {
    summon: number
    revival: number
    afterlife: string
  }
  logo: Logo
  onSelect: (tier: string, options?: {
    wordmark?: string
    domain?: string
  }) => void
}

export const PricingSelector = ({ price, logo, onSelect }: PricingSelectorProps) => {
  const [selectedTier, setSelectedTier] = React.useState("")
  const [withWordmark, setWithWordmark] = React.useState(false)
  const [wordmarkText, setWordmarkText] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [orderSummary, setOrderSummary] = React.useState({
    base: 0,
    wordmark: 0,
    total: 0
  })

  // Update summary when selections change
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

  const handlePurchase = () => {
    const options = {
      ...(withWordmark && wordmarkText && { wordmark: wordmarkText })
    }
    onSelect(selectedTier, options)
  }

  return (
    <div className="space-y-4 sticky top-24">
      <RadioGroup
        value={selectedTier}
        onValueChange={setSelectedTier}
        classNames={{
          wrapper: "gap-4"
        }}
      >
        <Card 
          className={`w-full bg-zinc-900/50 backdrop-blur-sm border transition-all duration-300 ease-in-out
            ${selectedTier === 'summon' ? 'border-white shadow-lg shadow-white/10' : 'border-white/10'}`}
        >
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Radio 
                value="summon" 
                className="text-white data-[selected=true]:text-white"
                classNames={{
                  wrapper: "[&>span]:!bg-white [&>span]:!border-white !border-white",
                  base: "!text-white"
                }}
              />
              <span className="font-mono text-sm tracking-wider opacity-50 uppercase">SUMMON</span>
            </div>
            <div className="text-2xl font-bold mb-4">$1,000</div>
            <p className="text-sm text-white/60 mb-4">Basic logo package with essential files</p>
            
            <AnimatePresence mode="wait">
              {selectedTier === 'summon' && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  layout
                  className="space-y-2"
                >
                  <li className="text-xs text-white/60">• Exclusive use licence</li>
                  <li className="text-xs text-white/60">• All editable formats</li>
                </motion.ul>
              )}
            </AnimatePresence>
          </CardBody>
        </Card>
        
        <Card 
          className={`w-full bg-zinc-900/50 backdrop-blur-sm border transition-all duration-300 ease-in-out
            ${selectedTier === 'revival' ? 'border-white shadow-lg shadow-white/10' : 'border-white/10'}`}
        >
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Radio 
                  value="revival" 
                  className="text-white data-[selected=true]:text-white"
                  classNames={{
                    wrapper: `[&>span]:!bg-white [&>span]:!border-white !border-white 
                      ${selectedTier === 'revival' ? '' : 'opacity-50'}`,
                    base: "!text-white"
                  }}
                />
                <span className="font-mono text-sm tracking-wider opacity-50 uppercase">REVIVAL</span>
              </div>
              <span className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/20">
                Most Popular
              </span>
            </div>
            <div className="text-2xl font-bold mb-4">$5,000</div>
            <p className="text-sm text-white/60 mb-4">Complete brand package with domain included</p>
            
            <AnimatePresence mode="wait">
              {selectedTier === 'revival' && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <li className="text-xs text-white/60">• Everything in Summon</li>
                  <li className="text-xs text-white/60">• Logomark Guidelines</li>
                  <li className="text-xs text-white/60">• Typography</li>
                  <li className="text-xs text-white/60">• Free Domain (up to $500 value)</li>
                </motion.ul>
              )}
            </AnimatePresence>
          </CardBody>
        </Card>

        <Card 
          className={`w-full bg-zinc-900/50 backdrop-blur-sm border transition-all duration-300 ease-in-out
            ${selectedTier === 'afterlife' ? 'border-white shadow-lg shadow-white/10' : 'border-white/10'}`}
        >
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Radio 
                value="afterlife" 
                className="text-white data-[selected=true]:text-white"
                classNames={{
                  wrapper: `[&>span]:!bg-white [&>span]:!border-white !border-white 
                    ${selectedTier === 'afterlife' ? '' : 'opacity-50'}`,
                  base: "!text-white"
                }}
              />
              <span className="font-mono text-sm tracking-wider opacity-50 uppercase">AFTERLIFE</span>
            </div>
            <p className="text-2xl font-bold mb-4">{price.afterlife}</p>
            <p className="text-sm text-white/60 mb-4">Custom branding experience with landing page</p>
            <AnimatePresence mode="wait">
              {selectedTier === 'afterlife' && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <li className="text-xs text-white/60">• Personalized Session</li>
                  <li className="text-xs text-white/60">• Custom Applications</li>
                  <li className="text-xs text-white/60">• Full Brand Strategy</li>
                  <li className="text-xs text-white/60">• 2 Week Design Sprint</li>
                  <li className="text-xs text-white/60">• One-page Landing Site</li>
                </motion.ul>
              )}
            </AnimatePresence>
          </CardBody>
        </Card>
      </RadioGroup>

      {(selectedTier === 'summon' || selectedTier === 'revival') && (
        <Card className="w-full bg-zinc-900/50 backdrop-blur-sm border border-white/10">
          <CardBody className="p-6 space-y-4">
            <span className="font-mono text-sm tracking-wider opacity-50 uppercase block mb-4">
              Add-ons
            </span>
            
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
                  We'll design a custom wordmark to match your logo. Delivery within 48 hours.
                </p>
              </div>
            )}

            <Button 
              className="w-full bg-white text-black hover:bg-white/90"
              onPress={handlePurchase}
              isLoading={isLoading}
            >
              Buy Now
            </Button>

            <motion.div
              key={`summary-${orderSummary.total}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
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
          </CardBody>
        </Card>
      )}

      {selectedTier === 'afterlife' && (
        <Card className="w-full bg-zinc-900/50 backdrop-blur-sm border border-white/10">
          <CardBody className="p-6 space-y-4">
            <p className="text-sm text-white/60">A dedicated team member will touch base with you to adapt this brand exactly to your needs.</p>
            <Button 
              className="w-full bg-white text-black hover:bg-white/90"
              onPress={handlePurchase}
            >
              Book a Call
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  )
} 