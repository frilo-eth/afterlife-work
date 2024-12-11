'use client'

import React from "react"
import { Button, Card, CardBody } from "@nextui-org/react"

export const DesignerSection = () => {
  return (
    <section className="py-24 bg-zinc-900/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">For Designers</h2>
          <p className="text-xl text-white/60 mb-12">
            Give your rejected logos a second chance at life
          </p>
          
          <Card className="bg-zinc-800/50 border border-white/10">
            <CardBody className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-left">
                  <h3 className="font-mono text-xl mb-4">Submit Your Work</h3>
                  <p className="text-white/60 mb-6">
                    Share your rejected logos with our community and earn from every resurrection.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {[
                      "Earn from every sale",
                      "Retain your copyright",
                      "Set your own prices",
                      "Join our community"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-white/50 rounded-full" />
                        <span className="text-sm text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex flex-col justify-center">
                  <Button
                    size="lg"
                    className="font-mono bg-white text-black hover:bg-white/90"
                  >
                    Submit Your Logo
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  )
} 