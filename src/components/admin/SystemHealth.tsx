'use client'

import { Circle } from 'lucide-react'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'error'
  latency?: number
  message?: string
}

interface SystemHealthProps {
  services: ServiceStatus[]
}

export function SystemHealth({ services }: SystemHealthProps) {
  const getStatusIcon = (status: ServiceStatus['status']) => {
    return <Circle className={`w-3 h-3 ${
      status === 'healthy' 
        ? 'fill-white/20' 
        : status === 'warning'
          ? 'fill-white/40'
          : 'fill-white/60'
    }`} />
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div 
          key={service.name}
          className="flex items-center justify-between p-3 rounded-lg bg-secondary"
        >
          <div className="flex items-center gap-3">
            {getStatusIcon(service.status)}
            <div>
              <h3 className="text-sm text-foreground">{service.name}</h3>
              {service.message && (
                <p className="text-xs text-foreground-subtle">{service.message}</p>
              )}
            </div>
          </div>
          {service.latency && (
            <span className="text-xs text-foreground-subtle">
              {service.latency}ms
            </span>
          )}
        </div>
      ))}
    </div>
  )
} 