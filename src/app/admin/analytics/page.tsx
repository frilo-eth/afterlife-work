'use client'

import { Card } from '@nextui-org/react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Analytics</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 bg-black">
          <h2 className="text-2xl font-bold mb-4">Revenue Overview</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
} 