'use client'

import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Button,
  Tooltip,
  Link
} from "@nextui-org/react"
import { Edit2, ExternalLink, Mail, Twitter } from 'lucide-react'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import type { Designer } from '@prisma/client'

export default function DesignersPage() {
  const [designers, setDesigners] = useState<Designer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const response = await fetch('/api/admin/designers')
        if (!response.ok) throw new Error('Failed to fetch designers')
        const data = await response.json()
        setDesigners(data.designers)
      } catch (error) {
        console.error('Error fetching designers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDesigners()
  }, [])

  if (loading) {
    return <div>Loading designers...</div>
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Designers</h1>
      </div>

      <Table aria-label="Designers table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>CONTACT</TableColumn>
          <TableColumn>SUBMISSIONS</TableColumn>
          <TableColumn>JOINED</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {designers.map((designer) => (
            <TableRow key={designer.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{designer.name}</span>
                  {designer.website && (
                    <Link 
                      href={designer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-small text-default-500"
                    >
                      {designer.website}
                    </Link>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`mailto:${designer.email}`}>
                    <Mail size={16} className="text-default-500" />
                  </Link>
                  {designer.twitter && (
                    <Link 
                      href={`https://twitter.com/${designer.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter size={16} className="text-default-500" />
                    </Link>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Link href={`/admin/logos?designer=${designer.id}`}>
                  View submissions
                </Link>
              </TableCell>
              <TableCell>
                {format(new Date(designer.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="Edit designer">
                    <Button 
                      isIconOnly 
                      variant="light"
                      onPress={() => {
                        // TODO: Implement edit functionality
                      }}
                    >
                      <Edit2 size={20} />
                    </Button>
                  </Tooltip>
                  <Tooltip content="View public profile">
                    <Button
                      as="a"
                      href={`/designers/${designer.id}`}
                      target="_blank"
                      isIconOnly
                      variant="light"
                    >
                      <ExternalLink size={20} />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 