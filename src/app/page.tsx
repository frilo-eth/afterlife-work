'use client'

import React from "react"
import { Button, Link } from "@nextui-org/react"
import { LogoCard } from "../components/logo/LogoCard"
import { FilterBar } from "../components/filters/FilterBar"

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 text-center z-10">
          <span className="font-mono text-sm tracking-wider opacity-50 mb-4 block">
            Resurrection Time
          </span>
          <h1 className="text-7xl font-bold mb-6 tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            Save time by saving souls
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/60 font-light">
          Unique, ready-to-use logos that died before seeying the light of day, waiting to be brought back.
          </p>
          <Button
            as={Link}
            href="#collection"
            variant="bordered"
            size="lg"
            className="font-mono"
            endContent={
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            }
          >
            Summon a Logo
          </Button>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="min-h-screen bg-black/50 backdrop-blur-sm">
        <FilterBar />
        
        <div className="container mx-auto px-4 py-24">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-2">The Limbo</h2>
              <p className="text-white/50 font-mono text-sm">
              A collection of souls, waiting its resurrection
              </p>
            </div>
            
            <Button
              variant="flat"
              className="font-mono"
              startContent={
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              }
            >
              Submit Logo
            </Button>
          </div>

          {/* Logo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(12).fill(0).map((_, i) => (
              <LogoCard
                key={i}
                id={`LOGO${i}`}
                title={`Logo Design ${i + 1}`}
                thumbnail=""
                tags={['Minimal', 'Tech']}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
} 