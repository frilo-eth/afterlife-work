'use client'

import { Suspense, useState } from 'react'
import { LogosTable } from '@/components/admin/LogosTable'
import { Button } from '@nextui-org/react'
import { Plus } from 'lucide-react'
import { useLogos } from '@/hooks/useLogos'
import { LoadingState } from '@/components/admin/LoadingState'
import type { LogoWithDetails } from '@/types'
import { LogoAddModal } from '@/components/admin/LogoAddModal'

export default function LogosPage() {
  const { logos, isLoading, error } = useLogos()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Failed to load logos</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Logos</h1>
        <Button 
          color="default" 
          variant="flat" 
          onPress={handleOpenAddModal}
        >
          <Plus size={20} className="mr-2" />
          Add New Logo
        </Button>
      </div>
      
      <Suspense fallback={<LoadingState />}>
        {!isLoading && logos?.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No logos found</p>
            <p className="text-sm text-gray-400">Add some logos to get started</p>
          </div>
        ) : (
          <LogosTable logos={logos?.map(logo => ({
            ...logo,
            updatedAt: logo.createdAt // Temporary fix until we update the API response
          })) as LogoWithDetails[]} />
        )}
      </Suspense>

      <LogoAddModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
      />
    </div>
  )
} 