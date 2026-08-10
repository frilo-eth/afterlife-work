'use client'

import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Tooltip,
} from '@nextui-org/react'
import { format } from 'date-fns'
import { CheckCircle, Edit2, ExternalLink, MessageCircle, Trash2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useLogos } from '@/hooks/useLogos'
import { generatePublicReference } from '@/lib/utils'
import type { LogoStatus, LogoWithDetails } from '@/types'
import LogoEditModal from './LogoEditModal'
import { ReviewModal } from './ReviewModal'

interface LogosTableProps {
  logos: LogoWithDetails[]
  groupedLogos?: Record<LogoStatus, LogoWithDetails[]>
}

// Status color mapping with specific colors
const statusColorMap: Record<LogoStatus, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-800',
  SOLD: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-amber-100 text-amber-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  HIDDEN: 'bg-red-100 text-red-800',
}

export function LogosTable({
  logos: initialLogos,
  groupedLogos: initialGroupedLogos,
}: LogosTableProps) {
  const { updateLogoStatus, deleteLogo, reviewLogo } = useLogos()
  const [selectedStatus, setSelectedStatus] = useState<LogoStatus>('AVAILABLE')
  const [selectedLogo, setSelectedLogo] = useState<LogoWithDetails | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean
    logo: LogoWithDetails | null
    action: 'REQUEST_CHANGES' | 'REJECT'
  }>({
    isOpen: false,
    logo: null,
    action: 'REQUEST_CHANGES',
  })

  // Filter logos based on selected status
  const filteredLogos = initialGroupedLogos?.[selectedStatus] || initialLogos

  const handleReviewAction = async (
    logo: LogoWithDetails,
    action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT',
    message?: string,
  ) => {
    try {
      await reviewLogo(logo.id, action, message)
      setReviewModal({ isOpen: false, logo: null, action: 'REQUEST_CHANGES' })
    } catch (error) {
      console.error('Review action error:', error)
    }
  }

  const handleStatusChange = async (logo: LogoWithDetails, newStatus: LogoStatus) => {
    try {
      await updateLogoStatus(logo.id, newStatus)
    } catch (error) {
      console.error('Error updating logo status:', error)
    }
  }

  const handleDelete = async (logo: LogoWithDetails) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${logo.title}"? This action cannot be undone.`,
      )
    ) {
      return
    }

    try {
      await deleteLogo(logo.id)
    } catch (error) {
      console.error('Error deleting logo:', error)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs
        selectedKey={selectedStatus}
        onSelectionChange={(key) => setSelectedStatus(key as LogoStatus)}
        classNames={{
          tab: 'data-[selected=true]:text-foreground',
          cursor: 'hidden',
        }}
      >
        {Object.entries(initialGroupedLogos || {}).map(([status, statusLogos]) => (
          <Tab
            key={status}
            title={
              <div className="flex items-center gap-2">
                <span>{status}</span>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${statusColorMap[status as LogoStatus]}`}
                >
                  {statusLogos.length}
                </span>
              </div>
            }
          />
        ))}
      </Tabs>

      <Table aria-label="Logos table">
        <TableHeader>
          <TableColumn>LOGO</TableColumn>
          <TableColumn>ID</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>CREATED</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredLogos.map((logo) => (
            <TableRow
              key={logo.id}
              className="cursor-pointer hover:bg-default-100"
              onClick={() => {
                setSelectedLogo(logo)
                setIsEditModalOpen(true)
              }}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <img
                    src={logo.thumbnail}
                    alt={logo.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="font-medium">{logo.title}</p>
                    <p className="text-small text-default-500">{logo.tags.join(', ')}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{generatePublicReference(logo.id)}</TableCell>
              <TableCell>
                <div
                  onClick={(e) => {
                    e.stopPropagation() // Prevent row click
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <Dropdown>
                    <DropdownTrigger>
                      <Chip className={`cursor-pointer ${statusColorMap[logo.status]}`} size="sm">
                        {logo.status}
                      </Chip>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Status options"
                      onAction={(key) => handleStatusChange(logo, key as LogoStatus)}
                      selectedKeys={[logo.status]}
                    >
                      {Object.keys(statusColorMap).map((status) => (
                        <DropdownItem key={status}>
                          <div className="flex items-center gap-2">
                            <Chip className={statusColorMap[status as LogoStatus]} size="sm">
                              {status}
                            </Chip>
                          </div>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </TableCell>
              <TableCell>{format(new Date(logo.createdAt), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {logo.status === 'REVIEW' ? (
                    <>
                      <Tooltip content="Approve logo">
                        <Button
                          isIconOnly
                          variant="light"
                          onPress={() => handleReviewAction(logo, 'APPROVE')}
                          className="text-success"
                        >
                          <CheckCircle size={20} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Request changes">
                        <Button
                          isIconOnly
                          variant="light"
                          onPress={() =>
                            setReviewModal({
                              isOpen: true,
                              logo,
                              action: 'REQUEST_CHANGES',
                            })
                          }
                          className="text-warning"
                        >
                          <MessageCircle size={20} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Reject logo">
                        <Button
                          isIconOnly
                          variant="light"
                          onPress={() =>
                            setReviewModal({
                              isOpen: true,
                              logo,
                              action: 'REJECT',
                            })
                          }
                          className="text-danger"
                        >
                          <XCircle size={20} />
                        </Button>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip content="Edit logo">
                        <Button
                          isIconOnly
                          variant="light"
                          onPress={() => {
                            setSelectedLogo(logo)
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Edit2 size={20} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="View public page">
                        <Button
                          as="a"
                          href={`/${logo.id}`}
                          target="_blank"
                          isIconOnly
                          variant="light"
                        >
                          <ExternalLink size={20} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete logo" color="danger">
                        <Button
                          isIconOnly
                          variant="light"
                          onPress={() => handleDelete(logo)}
                          className="text-danger hover:text-danger-400"
                        >
                          <Trash2 size={20} />
                        </Button>
                      </Tooltip>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedLogo && (
        <LogoEditModal
          logo={{
            ...selectedLogo,
            gallery:
              selectedLogo.gallery?.map((item, index: number) => ({
                id: item.id || `gallery-${index}`,
                imageUrl: item.imageUrl,
                logoId: selectedLogo.id,
              })) || [],
          }}
          isOpen={isEditModalOpen}
          onClose={() => {
            setSelectedLogo(null)
            setIsEditModalOpen(false)
          }}
        />
      )}

      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, logo: null, action: 'REQUEST_CHANGES' })}
        onSubmit={(message) => {
          if (reviewModal.logo) {
            handleReviewAction(reviewModal.logo, reviewModal.action, message)
          }
        }}
        title={reviewModal.action === 'REQUEST_CHANGES' ? 'Request Changes' : 'Reject Logo'}
        action={reviewModal.action}
      />
    </div>
  )
}
