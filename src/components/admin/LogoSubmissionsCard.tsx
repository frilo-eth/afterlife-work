'use client'

import { useEffect, useState } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip } from "@nextui-org/react"
import { format } from 'date-fns'
import type { LogoSubmission } from '@prisma/client'

export function LogoSubmissionsCard() {
  const [submissions, setSubmissions] = useState<LogoSubmission[]>([])

  useEffect(() => {
    fetch('/api/admin/submissions')
      .then(res => res.json())
      .then(data => setSubmissions(data.submissions.slice(0, 5)))
  }, [])

  return (
    <Table aria-label="Recent logo submissions">
      <TableHeader>
        <TableColumn>DESIGNER</TableColumn>
        <TableColumn>SUBMITTED</TableColumn>
        <TableColumn>STATUS</TableColumn>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow key={submission.id}>
            <TableCell>
              <User
                name={submission.designerName}
                description={submission.email}
                avatarProps={{ src: submission.logoUrl }}
              />
            </TableCell>
            <TableCell>{format(new Date(submission.createdAt), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              <Chip
                className="capitalize"
                color={submission.status === 'PENDING' ? 'warning' : 'success'}
                size="sm"
                variant="flat"
              >
                {submission.status.toLowerCase()}
              </Chip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 