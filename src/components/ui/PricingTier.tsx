'use client'

import React from "react"
import { Card, CardBody, Button } from "@nextui-org/react"

interface PricingTierProps {
  title: string
  price: number | string
  features: string[]
  highlighted?: boolean
  onSelect: () => void
  loading?: boolean
}

export const PricingTier = ({ 
  title, 
  price, 
  features, 
  highlighted, 
  onSelect,
  loading 
}: PricingTierProps) => (
  <Card 
    className={`
      bg-zinc-900/50 backdrop-blur-sm border border-white/10
      ${highlighted ? 'border-white/20 shadow-lg shadow-white/5' : ''}
    `}
  >
    <CardBody className="p-6">
      <h3 className="font-mono text-lg mb-2">{title}</h3>
      <p className="text-2xl font-bold mb-4">{
        typeof price === 'number' ? `$${price.toLocaleString()}` : price
      }</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="text-sm text-white/70 flex items-center gap-2">
            <span className="w-1 h-1 bg-white/50 rounded-full" />
            {feature}
          </li>
        ))}
      </ul>
      <Button 
        className="w-full font-mono"
        color={highlighted ? "primary" : "default"}
        variant={highlighted ? "solid" : "bordered"}
        onClick={onSelect}
        isLoading={loading}
      >
        {title === 'Afterlife' ? 'Book a Call' : 'Select Plan'}
      </Button>
    </CardBody>
  </Card>
) 