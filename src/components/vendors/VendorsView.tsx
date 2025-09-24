'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VendorsTable } from './VendorsTable'
import { AddVendorDialog } from './AddVendorDialog'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export interface Vendor {
  id: string
  name: string
  type: 'supplier' | 'contractor' | 'consultant' | 'other'
  category: string
  status: 'active' | 'inactive' | 'pending' | 'blacklisted'
  rating: number
  contact: {
    email: string
    phone: string
    address: string
    contactPerson: string
    title: string
  }
  business: {
    licenseNumber?: string
    taxId?: string
    insuranceExpiry?: string
    bondAmount?: number
    website?: string
  }
  performance: {
    totalOrders: number
    totalValue: number
    avgDeliveryTime: number
    onTimeDeliveryRate: number
    qualityRating: number
  }
  notes: string
  tags: string[]
  addedDate: string
  lastUpdated: string
  createdBy?: string
  createdByName?: string
}


export function VendorsView() {
  const { user } = useUser()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch vendors data from API
  const fetchVendors = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/vendors')
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendors')
      }
      
      const data = await response.json()
      setVendors(data.vendors)
      
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Failed to load vendors data')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Initial data fetch
  useEffect(() => {
    fetchVendors()
  }, [])


  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
          
          {selectedVendors.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selectedVendors.length} selected
              </Badge>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Vendors Table */}
      <VendorsTable
        vendors={vendors}
        selectedVendors={selectedVendors}
        onSelectedVendorsChange={setSelectedVendors}
        onVendorUpdate={fetchVendors}
        isLoading={isLoading}
      />

      {/* Add Vendor Dialog */}
      <AddVendorDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onVendorAdded={() => {
          fetchVendors()
          setIsAddDialogOpen(false)
        }}
      />
    </div>
  )
}