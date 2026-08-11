'use client'

import { Field } from '@base-ui/react/field'
import { format } from 'date-fns'
import { Edit2, ExternalLink, Globe, Mail, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { LoadingState } from '@/components/admin/LoadingState'
import { LogoThumbnailHover } from '@/components/admin/LogoThumbnailHover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDestructiveDialog } from '@/components/ui/confirm-destructive-dialog'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { InputField, InputGroup } from '@/components/ui/input-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip } from '@/components/ui/tooltip'
import { scheduleUndoableAction } from '@/lib/destructive-action'
import { fontWeights } from '@/lib/font-weight'
import { useShape } from '@/lib/shape-context'
import { cn } from '@/lib/utils'
import type { LogoStatus } from '@/types'

interface DesignerLogo {
  id: string
  title: string
  thumbnail: string
  status: LogoStatus
}

interface DesignerRow {
  id: string
  name: string
  email: string
  twitter: string | null
  website: string | null
  bio: string | null
  createdAt: string
  logos: DesignerLogo[]
  logoCount: number
}

const THUMB_LIMIT = 3

function ComposeTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 8,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) {
  const shape = useShape()
  const [isFocused, setIsFocused] = useState(false)

  return (
    <Field.Root className="flex flex-col gap-1">
      <Field.Label htmlFor={id} className="sr-only">
        {label}
      </Field.Label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder ?? label}
        rows={rows}
        className={cn(
          'w-full px-3 py-2 text-[13px] text-foreground',
          'placeholder:text-muted-foreground outline-none font-[inherit]',
          'ring-1 transition-all duration-80 resize-y min-h-[160px]',
          shape.input,
          'bg-card',
          isFocused ? 'ring-border' : 'ring-border',
        )}
        style={{ fontVariationSettings: fontWeights.normal }}
      />
    </Field.Root>
  )
}

export default function DesignersPage() {
  const [designers, setDesigners] = useState<DesignerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<DesignerRow | null>(null)
  const [emailing, setEmailing] = useState<DesignerRow | null>(null)
  const [designerPendingDelete, setDesignerPendingDelete] = useState<DesignerRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    twitter: '',
    website: '',
    bio: '',
  })
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
  })

  const fetchDesigners = async () => {
    try {
      const response = await fetch('/api/admin/designers')
      if (!response.ok) throw new Error('Failed to fetch designers')
      const data = await response.json()
      setDesigners(data.designers ?? [])
    } catch (error) {
      console.error('Error fetching designers:', error)
      toast.error('Failed to load designers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDesigners()
  }, [])

  const openEdit = (designer: DesignerRow) => {
    setEditing(designer)
    setForm({
      name: designer.name,
      email: designer.email,
      twitter: designer.twitter ?? '',
      website: designer.website ?? '',
      bio: designer.bio ?? '',
    })
  }

  const openEmail = (designer: DesignerRow) => {
    setEmailing(designer)
    setEmailForm({
      subject: '',
      message: `Hi ${designer.name.split(' ')[0] || designer.name},\n\n`,
    })
  }

  const handleSendEmail = async () => {
    if (!emailing) return
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      toast.error('Subject and message are required')
      return
    }

    setSendingEmail(true)
    const toastId = toast.loading('Sending email…')
    try {
      const response = await fetch('/api/admin/designers/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailing.email,
          designerName: emailing.name,
          subject: emailForm.subject,
          message: emailForm.message,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to send email')

      setEmailing(null)
      toast.success(`Email sent to ${emailing.name}`, { id: toastId })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send email', {
        id: toastId,
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSave = async () => {
    if (!editing) return
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    setSaving(true)
    const toastId = toast.loading('Saving designer…')
    try {
      const response = await fetch(`/api/admin/designers/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to update designer')

      setDesigners((prev) =>
        prev.map((d) =>
          d.id === editing.id
            ? {
                ...d,
                name: data.designer.name,
                email: data.designer.email,
                twitter: data.designer.twitter,
                website: data.designer.website,
                bio: data.designer.bio,
              }
            : d,
        ),
      )
      setEditing(null)
      toast.success('Designer updated', { id: toastId })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update designer', {
        id: toastId,
      })
    } finally {
      setSaving(false)
    }
  }

  const requestDelete = (designer: DesignerRow) => {
    setDesignerPendingDelete(designer)
  }

  const confirmDelete = () => {
    if (!designerPendingDelete) return
    const snapshot = designerPendingDelete
    setDesignerPendingDelete(null)

    setDesigners((prev) => prev.filter((d) => d.id !== snapshot.id))

    scheduleUndoableAction({
      message: `Deleted “${snapshot.name}”`,
      description: 'Their logos stay in the catalog. Undo available for a few seconds.',
      onUndo: () => {
        setDesigners((prev) => {
          if (prev.some((d) => d.id === snapshot.id)) return prev
          return [snapshot, ...prev]
        })
      },
      onCommit: async () => {
        const response = await fetch(`/api/admin/designers/${snapshot.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to delete designer')
        }
      },
    })
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-heading-24 text-foreground">Designers</h1>
        <p className="text-caption text-foreground-muted">People with logos on Afterlife.</p>
      </header>

      {loading ? (
        <LoadingState />
      ) : designers.length === 0 ? (
        <p className="py-10 text-center text-caption text-foreground-muted">No designers yet.</p>
      ) : (
        <Table aria-label="Designers">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Logos</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {designers.map((designer) => {
              const visible = designer.logos.slice(0, THUMB_LIMIT)
              const overflow = Math.max(designer.logos.length - THUMB_LIMIT, 0)

              return (
                <TableRow key={designer.id}>
                  <TableCell>
                    <p className="truncate text-label text-foreground">{designer.name}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Tooltip content={`Email ${designer.name}`}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Email ${designer.name}`}
                          onClick={() => openEmail(designer)}
                        >
                          <Mail />
                        </Button>
                      </Tooltip>
                      {designer.website && (
                        <Tooltip content={designer.website}>
                          <Button asChild variant="ghost" size="icon-sm">
                            <a
                              href={
                                /^https?:\/\//i.test(designer.website)
                                  ? designer.website
                                  : `https://${designer.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${designer.name} website`}
                            >
                              <Globe />
                            </a>
                          </Button>
                        </Tooltip>
                      )}
                      {designer.twitter && (
                        <Tooltip content={`@${designer.twitter.replace('@', '')}`}>
                          <Button asChild variant="ghost" size="icon-sm">
                            <a
                              href={`https://x.com/${designer.twitter.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${designer.name} on X`}
                            >
                              <ExternalLink />
                            </a>
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-caption text-foreground-muted">
                    {format(new Date(designer.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {visible.length === 0 ? (
                      <span className="text-caption text-foreground-subtle">None</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {visible.map((logo) => (
                          <LogoThumbnailHover
                            key={logo.id}
                            src={logo.thumbnail}
                            title={logo.title}
                            status={logo.status}
                            size="sm"
                          />
                        ))}
                        {overflow > 0 && (
                          <Badge variant="solid" color="gray" size="sm">
                            +{overflow}
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-0.5">
                      <Tooltip content="Edit">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${designer.name}`}
                          onClick={() => openEdit(designer)}
                        >
                          <Edit2 />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${designer.name}`}
                          onClick={() => requestDelete(designer)}
                        >
                          <Trash2 />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent hideClose placement="fullscreen">
          <DialogTitle className="sr-only">Edit designer</DialogTitle>

          <Button
            type="button"
            variant="tertiary"
            size="icon"
            aria-label="Close"
            onClick={() => setEditing(null)}
            className="fixed right-4 top-4 z-[101]"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="container mx-auto px-4 py-20 sm:py-24">
            <div className="mx-auto max-w-xl">
              <div className="mb-10 space-y-3 sm:mb-14">
                <span className="block font-mono text-metadata uppercase text-foreground-subtle">
                  Edit designer
                </span>
                <h2 className="text-heading-24 text-foreground">Update designer details</h2>
                <p className="text-caption text-foreground-muted">
                  Name, contact, and profile for this designer.
                </p>
              </div>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  void handleSave()
                }}
              >
                <InputGroup className="w-full">
                  <InputField
                    index={0}
                    label="Name"
                    hideLabel
                    placeholder="Name"
                    value={form.name}
                    onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
                    required
                  />
                  <InputField
                    index={1}
                    label="Email"
                    hideLabel
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
                    required
                  />
                  <InputField
                    index={2}
                    label="Twitter"
                    hideLabel
                    placeholder="X / Twitter handle"
                    value={form.twitter}
                    onChange={(value) => setForm((prev) => ({ ...prev, twitter: value }))}
                  />
                  <InputField
                    index={3}
                    label="Website"
                    hideLabel
                    placeholder="Website"
                    value={form.website}
                    onChange={(value) => setForm((prev) => ({ ...prev, website: value }))}
                  />
                  <InputField
                    index={4}
                    label="Bio"
                    hideLabel
                    placeholder="Bio"
                    value={form.bio}
                    onChange={(value) => setForm((prev) => ({ ...prev, bio: value }))}
                  />
                </InputGroup>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={saving}
                  className="w-full"
                >
                  Save changes
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!emailing}
        onOpenChange={(open) => {
          if (!open) setEmailing(null)
        }}
      >
        <DialogContent hideClose placement="fullscreen">
          <DialogTitle className="sr-only">Email designer</DialogTitle>

          <Button
            type="button"
            variant="tertiary"
            size="icon"
            aria-label="Close"
            onClick={() => setEmailing(null)}
            className="fixed right-4 top-4 z-[101]"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="container mx-auto px-4 py-20 sm:py-24">
            <div className="mx-auto max-w-xl">
              <div className="mb-10 space-y-3 sm:mb-14">
                <span className="block font-mono text-metadata uppercase text-foreground-subtle">
                  Email designer
                </span>
                <h2 className="text-heading-24 text-foreground">
                  Write to {emailing?.name ?? 'designer'}
                </h2>
                <p className="text-caption text-foreground-muted">
                  Branded Afterlife email (plain text to Apple Mail) · replies to hi@afterlife.work.
                </p>
              </div>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  void handleSendEmail()
                }}
              >
                <InputGroup className="w-full">
                  <InputField
                    index={0}
                    label="To"
                    hideLabel
                    placeholder="To"
                    value={emailing?.email ?? ''}
                    onChange={() => {}}
                    disabled
                  />
                  <InputField
                    index={1}
                    label="Subject"
                    hideLabel
                    placeholder="Subject"
                    value={emailForm.subject}
                    onChange={(value) => setEmailForm((prev) => ({ ...prev, subject: value }))}
                    required
                  />
                </InputGroup>

                <ComposeTextarea
                  id="designer-email-message"
                  label="Message"
                  placeholder="Message"
                  value={emailForm.message}
                  onChange={(value) => setEmailForm((prev) => ({ ...prev, message: value }))}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={sendingEmail}
                  className="w-full"
                >
                  Send email
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDestructiveDialog
        open={!!designerPendingDelete}
        onOpenChange={(open) => {
          if (!open) setDesignerPendingDelete(null)
        }}
        title="Delete designer"
        description={
          designerPendingDelete ? (
            <>
              Delete <span className="text-foreground">“{designerPendingDelete.name}”</span>? Their
              logos stay in the catalog. You can undo for a few seconds after confirming.
            </>
          ) : null
        }
        confirmLabel="Delete designer"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
