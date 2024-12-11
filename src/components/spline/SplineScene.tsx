'use client'

import React from 'react'

interface SplineSceneProps {
  scene: string
}

export const SplineScene = ({ scene }: SplineSceneProps) => {
  return (
    <div className="w-full h-full bg-black">
      {/* Placeholder for Spline scene */}
      <iframe 
        src={scene}
        className="w-full h-full border-0"
        title="3D Scene"
      />
    </div>
  )
} 