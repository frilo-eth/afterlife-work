'use client'

import React from "react"
import { Card, Image, Button, Link } from "@nextui-org/react"
import { ChevronLeft } from "lucide-react"
import { PricingTier } from "../../components/ui/PricingTier"

export default function LogoDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Button
          as={Link}
          href="/"
          variant="light"
          className="mb-8 font-mono"
          startContent={<ChevronLeft className="w-4 h-4" />}
        >
          Back to Collection
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Logo Preview */}
          <Card className="aspect-square bg-zinc-900/50 backdrop-blur-sm border border-white/10 p-16">
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src={`/logos/${params.slug}.png`}
                alt="Logo Preview"
                classNames={{
                  wrapper: "w-full h-full",
                  img: "object-contain w-full h-full"
                }}
                onError={() => {
                  const target = document.querySelector('img') as HTMLImageElement;
                  target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white/30">No Preview</div>';
                }}
              />
            </div>
          </Card>

          {/* Info & Pricing */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Logo Title</h1>
              <div className="flex gap-2 mb-6">
                {['Minimal', 'Tech'].map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/10">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-white/60">
                A brief description of the logo and its design philosophy would go here. 
                This explains the thought process and potential applications.
              </p>
            </div>
            
            {/* Pricing Tiers */}
            <div className="space-y-4">
              <PricingTier
                title="Glyph Only"
                price={1000}
                features={["Original vector files", "Basic usage guidelines"]}
              />
              <PricingTier
                title="Glyph + System"
                price={3000}
                features={["Complete brand system", "Extended guidelines", "Usage examples"]}
                highlighted
              />
              <PricingTier
                title="Custom Made"
                price="Starting at $5,000/week"
                features={["Personal consultation", "Custom adaptations", "Full brand strategy"]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 