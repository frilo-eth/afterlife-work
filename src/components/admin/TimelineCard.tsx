'use client'

import { useEffect, useState } from 'react'
import { ScrollShadow } from "@nextui-org/react"
import { format } from 'date-fns'
import { Activity } from 'lucide-react'

type TimelineEvent = {
  id: string
  type: 'ORDER' | 'SUBMISSION' | 'APPROVAL' | 'DESIGNER'
  description: string
  timestamp: Date
}

export function TimelineCard() {
  const [events, setEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    fetch('/api/admin/timeline')
      .then(res => res.json())
      .then(data => setEvents(data.events))
  }, [])

  return (
    <ScrollShadow className="h-[400px]">
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-4 items-start">
            <div className="p-2 rounded-full bg-white/5">
              <Activity className="w-4 h-4 text-white/90" />
            </div>
            <div>
              <p className="text-white/90">{event.description}</p>
              <p className="text-sm text-white/40">
                {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollShadow>
  )
} 