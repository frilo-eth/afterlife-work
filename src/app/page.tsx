'use client'

import React, { Suspense } from "react"
import { Button } from "@nextui-org/react"
import { SplineScene } from "../components/spline/SplineScene"
import { CollectionLayout } from "../components/collection/CollectionLayout"
import { DesignerSection } from "@/components/sections/DesignerSection"

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen">
        {/* Spline Background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full bg-black" />}>
            <SplineScene scene="https://prod.spline.design/7jLFqGqX7efOXqtR/scene.splinecode" />
          </Suspense>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="container mx-auto px-4 text-center">
            <span className="font-mono text-sm tracking-wider opacity-50 mb-4 block">
              Resurrection Time
            </span>
            <h1 className="text-7xl font-bold mb-6 tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              Save time by saving souls
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/60 font-light">
              Unique, ready-to-use logos that died before seeing the light of day, waiting to be brought back.
            </p>
            <Button
              size="lg"
              className="font-mono bg-white text-black hover:bg-white/90"
            >
              Summon a Logo
            </Button>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">The Graveyard</h2>
          <p className="text-xl text-white/60 mb-12">
            A collection of souls, waiting for resurrection
          </p>
          <CollectionLayout />
        </div>
      </section>

      {/* Designer Section */}
      <DesignerSection />
    </>
  )
} 