'use client'

import React from "react"
import { useParams } from "next/navigation"
import { Button, Card, Image } from "@nextui-org/react"
import { ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
import { logos } from "@/lib/data/logos"
import { PricingTier } from "@/components/ui/PricingTier"

export default function LogoDetailPage() {
  const { id } = useParams()
  const logo = logos.find(l => l.id === id)

  if (!logo) return <div>Logo not found</div>

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            as="a"
            href="/#collection"
            variant="light"
            className="mb-8"
            startContent={<ChevronLeft className="w-4 h-4" />}
          >
            Back to Collection
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-zinc-900/50 p-12 aspect-square">
              <Image
                src={logo.thumbnail}
                alt={logo.title}
                className="w-full h-full object-contain"
              />
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div>
              <h1 className="text-4xl font-bold mb-4">{logo.title}</h1>
              <div className="flex gap-2 mb-6">
                {logo.tags.map(tag => (
                  <span key={tag} className="text-sm px-3 py-1 rounded-full bg-white/10">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-lg text-white/60 mb-8">
                {logo.description}
              </p>

              {/* Pricing Options */}
              <div className="space-y-4">
                <PricingTier
                  title="Glyph Only"
                  price={logo.price.glyph}
                  features={[
                    "Logo mark only",
                    "High resolution files",
                    "Basic usage rights"
                  ]}
                />
                <PricingTier
                  title="Complete System"
                  price={logo.price.system}
                  features={[
                    "Logo mark and wordmark",
                    "Color variations",
                    "Full usage rights",
                    "Basic style guide"
                  ]}
                  highlighted
                />
                <PricingTier
                  title="Custom Package"
                  price={logo.price.custom}
                  features={[
                    "Custom modifications",
                    "Extended brand system",
                    "Comprehensive style guide",
                    "Priority support"
                  ]}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 