'use client'

import React, { useState } from "react"
import { Input, Button } from "@nextui-org/react"
import { ArrowRight, Mail } from "lucide-react"
import { subscribeToNewsletter } from "@/lib/api"

export const Hero = () => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState("")

  const handleSubscribe = async () => {
    if (!email) return
    
    setStatus('loading')
    const response = await subscribeToNewsletter(email)
    
    if (response.success) {
      setStatus('success')
      setMessage('Thanks for subscribing!')
      setEmail('')
    } else {
      setStatus('error')
      setMessage(response.message)
    }
  }

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center">
      {/* Restore original structure but fixed overflow */}
      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden opacity-10" 
           style={{
             marginTop: '-64px' // Original value, keeps position but constrains overflow
           }}>
        <div 
          className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <span className="font-mono text-sm tracking-wider opacity-50 block uppercase">
              Revive a lost mark
            </span>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r 
                         from-white to-white/60 bg-clip-text text-transparent 
                         leading-[1.4] pb-2">
              Save logos, save time
            </h1>
            
            <p className="text-xl text-white/60 max-w-xl mx-auto">
              Unique, ready-to-use logos that died before seeing the light of day, 
              waiting to be brought back.
            </p>
          </div>
          
          <div className="max-w-md mx-auto relative">
            <div className="flex w-full gap-2 isolate">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={
                  <Mail className="text-white/50" size={16} />
                }
                classNames={{
                  input: "bg-transparent text-sm",
                  inputWrapper: [
                    "bg-black",
                    "border border-white/10",
                    "hover:border-white/20",
                    "h-10",
                    "px-3",
                    "!rounded-lg",
                  ]
                }}
              />
              <Button
                className="bg-white text-black font-medium hover:bg-white/90 text-sm h-10 px-4 rounded-lg"
                onPress={handleSubscribe}
                size="sm"
                isLoading={status === 'loading'}
              >
                Subscribe
              </Button>
            </div>
            {message && (
              <p className={`text-sm mt-2 ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 