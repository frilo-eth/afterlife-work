'use client'

import {
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { useEffect, useState } from 'react'

interface Submission {
  id: string
  designerName: string
  email: string
  twitter?: string
  description: string
  logoUrl: string
  mockupUrls: string[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [_loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions')
      const data = await response.json()
      setSubmissions(data.submissions)
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Logo Submissions</h1>

      <Card>
        <Table aria-label="Submissions table">
          <TableHeader>
            <TableColumn>DESIGNER</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>LOGO</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>SUBMITTED</TableColumn>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>{submission.designerName}</TableCell>
                <TableCell>{submission.email}</TableCell>
                <TableCell>
                  <img
                    src={submission.logoUrl}
                    alt="Logo"
                    className="w-12 h-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    color={
                      submission.status === 'APPROVED'
                        ? 'success'
                        : submission.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {submission.status}
                  </Chip>
                </TableCell>
                <TableCell>{new Date(submission.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
