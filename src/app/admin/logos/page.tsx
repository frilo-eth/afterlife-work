'use client'

import { Plus } from 'lucide-react'
import { Suspense, useState } from 'react'
import { LoadingState } from '@/components/admin/LoadingState'
import { LogoAddModal } from '@/components/admin/LogoAddModal'
import { LogosTable } from '@/components/admin/LogosTable'
import { Button } from '@/components/ui/button'
import { useLogos } from '@/hooks/useLogos'
import type { LogoWithDetails } from '@/types'

export default function LogosPage() {
  const {
    logos,
    groupedLogos,
    isLoading,
    error,
    updateLogoStatus,
    deleteLogo,
    trashLogo,
    reviewLogo,
  } = useLogos()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-caption text-destructive">Failed to load logos</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-heading-24 text-foreground">Logos</h1>
          <p className="text-caption text-foreground-muted">Catalog, submissions, and status.</p>
        </div>
        <Button
          variant="secondary"
          size="md"
          leadingIcon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add logo
        </Button>
      </div>

      <Suspense fallback={<LoadingState />}>
        {isLoading ? (
          <LoadingState />
        ) : !logos?.length ? (
          <div className="py-10 text-center">
            <p className="text-caption text-foreground-muted">No logos yet</p>
            <p className="mt-1 text-caption text-foreground-subtle">
              Add a logo to start the catalog.
            </p>
          </div>
        ) : (
          <LogosTable
            logos={
              logos.map((logo) => ({
                ...logo,
                updatedAt: logo.updatedAt ?? logo.createdAt,
              })) as LogoWithDetails[]
            }
            groupedLogos={groupedLogos}
            updateLogoStatus={updateLogoStatus}
            deleteLogo={deleteLogo}
            trashLogo={trashLogo}
            reviewLogo={reviewLogo}
          />
        )}
      </Suspense>

      <LogoAddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  )
}
