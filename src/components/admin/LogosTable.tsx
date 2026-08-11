'use client'

import { format } from 'date-fns'
import {
  CheckCircle,
  Copy,
  Edit2,
  ExternalLink,
  MessageCircle,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDestructiveDialog } from '@/components/ui/confirm-destructive-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TabItem, Tabs, TabsList } from '@/components/ui/tabs'
import { Tooltip } from '@/components/ui/tooltip'
import {
  ALL_LOGO_STATUSES,
  isPubliclyListed,
  isStatusLocked,
  isTrashed,
  MANUAL_STATUSES,
  TRASH_RESTORE_STATUS,
} from '@/lib/logo-status'
import { generatePublicReference } from '@/lib/utils'
import type { LogoStatus, LogoWithDetails } from '@/types'
import LogoEditModal from './LogoEditModal'
import { LogoStatusDropdown, STATUS_LABEL } from './LogoStatusDropdown'
import { LogoThumbnailHover } from './LogoThumbnailHover'
import { ReviewModal } from './ReviewModal'

interface LogosTableProps {
  logos: LogoWithDetails[]
  groupedLogos?: Record<LogoStatus, LogoWithDetails[]>
  updateLogoStatus: (logoId: string, status: LogoStatus) => Promise<void>
  deleteLogo: (logoId: string) => void
  trashLogo: (logoId: string) => Promise<void>
  reviewLogo: (
    logoId: string,
    action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT',
    message?: string,
  ) => Promise<void>
}

const STATUS_ORDER = ALL_LOGO_STATUSES

function groupByStatus(logos: LogoWithDetails[]): Record<LogoStatus, LogoWithDetails[]> {
  const empty = Object.fromEntries(STATUS_ORDER.map((s) => [s, [] as LogoWithDetails[]])) as Record<
    LogoStatus,
    LogoWithDetails[]
  >
  for (const logo of logos) {
    empty[logo.status]?.push(logo)
  }
  return empty
}

function isLogoStatus(value: string | null): value is LogoStatus {
  return !!value && (STATUS_ORDER as readonly string[]).includes(value)
}

export function LogosTable({
  logos: initialLogos,
  groupedLogos: initialGroupedLogos,
  updateLogoStatus,
  deleteLogo,
  trashLogo,
  reviewLogo,
}: LogosTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const grouped = useMemo(
    () => initialGroupedLogos ?? groupByStatus(initialLogos),
    [initialGroupedLogos, initialLogos],
  )

  const [selectedStatus, setSelectedStatus] = useState<LogoStatus>(() => {
    const fromUrl = searchParams.get('status')
    if (isLogoStatus(fromUrl)) return fromUrl
    const withItems = STATUS_ORDER.find((status) => (grouped[status]?.length ?? 0) > 0)
    return withItems ?? 'AVAILABLE'
  })
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
  const [logoPendingAction, setLogoPendingAction] = useState<{
    logo: LogoWithDetails
    kind: 'trash' | 'purge'
  } | null>(null)

  useEffect(() => {
    const fromUrl = searchParams.get('status')
    if (isLogoStatus(fromUrl) && fromUrl !== selectedStatus) {
      setSelectedStatus(fromUrl)
    }
  }, [searchParams, selectedStatus])

  const filteredLogos = (grouped[selectedStatus] ?? []).filter((logo) => !!logo?.id)
  const viewingTrash = selectedStatus === 'TRASH'

  const setStatusFilter = (status: LogoStatus) => {
    setSelectedStatus(status)
    const params = new URLSearchParams(searchParams.toString())
    params.set('status', status)
    router.replace(`/admin/logos?${params.toString()}`, { scroll: false })
  }

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

  const handleStatusChange = (logo: LogoWithDetails, newStatus: LogoStatus) => {
    if (isStatusLocked(logo.status) || newStatus === 'SOLD' || logo.status === newStatus) {
      return
    }
    // Fire-and-forget: hook applies optimistic UI immediately.
    void updateLogoStatus(logo.id, newStatus)
  }

  const requestTrash = (logo: LogoWithDetails) => {
    if (isStatusLocked(logo.status)) {
      toast.error('Sold logos cannot be moved to Trash')
      return
    }
    if (isTrashed(logo.status)) {
      setLogoPendingAction({ logo, kind: 'purge' })
      return
    }
    setLogoPendingAction({ logo, kind: 'trash' })
  }

  const requestPurge = (logo: LogoWithDetails) => {
    if (!isTrashed(logo.status)) {
      toast.error('Move the logo to Trash first')
      return
    }
    setLogoPendingAction({ logo, kind: 'purge' })
  }

  const confirmPendingAction = () => {
    if (!logoPendingAction) return
    const { logo, kind } = logoPendingAction
    setLogoPendingAction(null)
    if (kind === 'purge') {
      deleteLogo(logo.id)
      return
    }
    void trashLogo(logo.id)
  }

  const restoreFromTrash = async (logo: LogoWithDetails) => {
    try {
      await updateLogoStatus(logo.id, TRASH_RESTORE_STATUS)
    } catch (error) {
      console.error('Error restoring logo:', error)
    }
  }

  const openEdit = (logo: LogoWithDetails) => {
    setSelectedLogo(logo)
    setIsEditModalOpen(true)
  }

  const copyPublicUrl = async (logo: LogoWithDetails) => {
    const url = `${window.location.origin}/${logo.slug || logo.id}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success(isPubliclyListed(logo.status) ? 'Public link copied' : 'Link copied', {
        description: isPubliclyListed(logo.status)
          ? 'Anyone with the link can view this logo.'
          : 'Not listed publicly yet — the link shows an empty page.',
      })
    } catch {
      toast.error('Could not copy link')
    }
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={selectedStatus}
        onValueChange={(value) => {
          if (isLogoStatus(value)) setStatusFilter(value)
        }}
      >
        <TabsList aria-label="Filter by status">
          {STATUS_ORDER.map((status) => {
            const count = grouped[status]?.length ?? 0
            return (
              <TabItem key={status} value={status} label={STATUS_LABEL[status]} count={count} />
            )
          })}
        </TabsList>
      </Tabs>

      {filteredLogos.length === 0 ? (
        <p className="py-10 text-center text-caption text-foreground-muted">
          {viewingTrash
            ? 'Trash is empty.'
            : `No logos in ${STATUS_LABEL[selectedStatus].toLowerCase()}.`}
        </p>
      ) : (
        <Table aria-label="Logos">
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Designer</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogos.map((logo) => (
              <TableRow
                key={logo.id}
                className={viewingTrash ? undefined : 'cursor-pointer'}
                onClick={() => {
                  if (!viewingTrash) openEdit(logo)
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <LogoThumbnailHover
                      src={logo.thumbnail}
                      title={logo.title}
                      status={logo.status}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-label text-foreground">{logo.title}</p>
                      {logo.tags?.length > 0 && (
                        <p className="truncate text-caption text-foreground-subtle">
                          {logo.tags.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-caption text-foreground-muted">
                  {logo.designer?.name ? (
                    <span className="truncate text-foreground" title={logo.designer.email}>
                      {logo.designer.name}
                    </span>
                  ) : logo.designerEmail ? (
                    <span className="truncate" title={logo.designerEmail}>
                      {logo.designerEmail}
                    </span>
                  ) : (
                    <span className="text-foreground-subtle">—</span>
                  )}
                </TableCell>
                <TableCell
                  className="font-mono text-caption"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <Tooltip
                    content={
                      isPubliclyListed(logo.status)
                        ? 'Copy public link'
                        : 'Copy link (not public yet)'
                    }
                  >
                    <button
                      type="button"
                      onClick={() => void copyPublicUrl(logo)}
                      className="group/id inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 -mx-1.5 text-foreground-muted outline-none transition-colors duration-80 hover:bg-hover hover:text-foreground focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)]"
                      aria-label={`Copy link for ${generatePublicReference(logo.id)}`}
                    >
                      <span className="underline-offset-2 group-hover/id:underline">
                        {generatePublicReference(logo.id)}
                      </span>
                      <Copy
                        className="h-3 w-3 shrink-0 opacity-0 transition-opacity duration-80 group-hover/id:opacity-100 group-focus-visible/id:opacity-100"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </button>
                  </Tooltip>
                </TableCell>
                <TableCell
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <LogoStatusDropdown
                    value={logo.status}
                    options={MANUAL_STATUSES}
                    onChange={(next) => handleStatusChange(logo, next)}
                    readOnly={isStatusLocked(logo.status)}
                  />
                </TableCell>
                <TableCell className="text-caption text-foreground-muted">
                  {format(new Date(logo.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-0.5">
                    {logo.status === 'REVIEW' ? (
                      <>
                        <Tooltip content="Approve">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Approve logo"
                            onClick={() => handleReviewAction(logo, 'APPROVE')}
                          >
                            <CheckCircle />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Request changes">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Request changes"
                            onClick={() =>
                              setReviewModal({
                                isOpen: true,
                                logo,
                                action: 'REQUEST_CHANGES',
                              })
                            }
                          >
                            <MessageCircle />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Reject">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            aria-label="Reject logo"
                            onClick={() =>
                              setReviewModal({
                                isOpen: true,
                                logo,
                                action: 'REJECT',
                              })
                            }
                          >
                            <XCircle />
                          </Button>
                        </Tooltip>
                      </>
                    ) : isStatusLocked(logo.status) ? (
                      <Tooltip content="View public page">
                        <Button asChild variant="ghost" size="icon-sm">
                          <a
                            href={`/${logo.slug || logo.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="View public page"
                          >
                            <ExternalLink />
                          </a>
                        </Button>
                      </Tooltip>
                    ) : viewingTrash || isTrashed(logo.status) ? (
                      <>
                        <Tooltip content="Restore to Draft">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Restore logo"
                            onClick={() => void restoreFromTrash(logo)}
                          >
                            <RotateCcw />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete forever">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            aria-label="Delete logo forever"
                            onClick={() => requestPurge(logo)}
                          >
                            <Trash2 />
                          </Button>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip content="Edit">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Edit logo"
                            onClick={() => openEdit(logo)}
                          >
                            <Edit2 />
                          </Button>
                        </Tooltip>
                        <Tooltip
                          content={
                            isPubliclyListed(logo.status) ? 'View public page' : 'Preview page'
                          }
                        >
                          <Button asChild variant="ghost" size="icon-sm">
                            <a
                              href={
                                isPubliclyListed(logo.status)
                                  ? `/${logo.slug || logo.id}`
                                  : `/admin/logos/preview/${logo.id}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={
                                isPubliclyListed(logo.status) ? 'View public page' : 'Preview page'
                              }
                            >
                              <ExternalLink />
                            </a>
                          </Button>
                        </Tooltip>
                        <Tooltip content="Move to Trash">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            aria-label="Move logo to Trash"
                            onClick={() => requestTrash(logo)}
                          >
                            <Trash2 />
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
      )}

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

      <ConfirmDestructiveDialog
        open={!!logoPendingAction}
        onOpenChange={(open) => {
          if (!open) setLogoPendingAction(null)
        }}
        title={logoPendingAction?.kind === 'purge' ? 'Delete forever' : 'Move to Trash'}
        description={
          logoPendingAction ? (
            logoPendingAction.kind === 'purge' ? (
              <>
                Permanently delete{' '}
                <span className="text-foreground">“{logoPendingAction.logo.title}”</span>? This
                removes it from the database and cannot be undone after a few seconds.
              </>
            ) : (
              <>
                Move <span className="text-foreground">“{logoPendingAction.logo.title}”</span> to
                Trash? You can restore it later, or delete it forever from Trash.
              </>
            )
          ) : null
        }
        confirmLabel={logoPendingAction?.kind === 'purge' ? 'Delete forever' : 'Move to Trash'}
        onConfirm={confirmPendingAction}
      />
    </div>
  )
}
