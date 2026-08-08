'use client'

import { useState, useEffect, useCallback } from 'react'

interface LoadingScreenProps {
  isLoading?: boolean // Make prop optional
}

export const LoadingScreen = ({ isLoading = false }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [currentText, setCurrentText] = useState('')
  const [totalDots, setTotalDots] = useState(100)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)

  useEffect(() => {
    const updateDots = () => {
      setTotalDots(Math.max(100, Math.floor(window.innerWidth / 10)))
    }
    
    updateDots()
    window.addEventListener('resize', updateDots)
    return () => window.removeEventListener('resize', updateDots)
  }, [])

  const scrambleText = useCallback((text: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?'
    return text.split('').map(() => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
  }, [])

  useEffect(() => {
    if (!isLoading && progress === 100) {
      setTimeout(() => setIsVisible(false), 100)
    }
  }, [isLoading, progress])

  useEffect(() => {
    const finalText = 'LIFE REBOOTING'
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        // Only reach 100 if the page is actually loaded
        if (prev >= 98 && !isLoading) {
          clearInterval(progressTimer)
          setIsAnimationComplete(true)
          return 100
        }
        // Stay at 98 if page is still loading
        if (prev >= 98 && isLoading) {
          return 98
        }
        return prev + 4
      })
    }, 16)

    let iterations = 0
    const maxIterations = 3
    const decryptTimer = setInterval(() => {
      if (iterations >= maxIterations) {
        setCurrentText(finalText)
        clearInterval(decryptTimer)
        return
      }

      setCurrentText(prev => {
        const scrambled = scrambleText(finalText)
        const progress = iterations / maxIterations
        const decryptedLength = Math.floor(finalText.length * progress)
        
        return finalText.slice(0, decryptedLength) + 
               scrambled.slice(decryptedLength)
      })

      iterations++
    }, 16)

    return () => {
      clearInterval(progressTimer)
      clearInterval(decryptTimer)
    }
  }, [scrambleText, isLoading])

  if (!isVisible) return null

  const filledDots = Math.floor(totalDots * (progress / 100))

  const progressDots = Array.from({ length: totalDots }, (_, i) => ({
    id: `dot-${i}-${progress}`,
    char: '.',
    opacity: i < filledDots 
      ? Math.min(0.6, 0.1 + (i / filledDots) * 0.5)
      : 0.1
  }))

  return (
    <div className="fixed inset-0 bg-black z-[200] flex items-center">
      <div className="w-full px-8">
        <div className="font-mono text-xs tracking-[0.2em] flex items-center w-full">
          <span className="text-white/60">{currentText}</span>
          <div className="flex-1 mx-2 overflow-hidden whitespace-nowrap">
            {progressDots.map((dot) => (
              <span 
                key={dot.id}
                className="transition-opacity duration-50"
                style={{ color: `rgba(255, 255, 255, ${dot.opacity})` }}
              >
                {dot.char}
              </span>
            ))}
          </div>
          <span className="text-white/60">{progress.toString().padStart(3, '0')}%</span>
        </div>
      </div>
    </div>
  )
} 