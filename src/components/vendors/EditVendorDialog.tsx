'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Vendor } from './VendorsView'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface EditVendorDialogProps {
  vendor: Vendor | null
  isOpen: boolean
  onClose: () => void
  onVendorUpdated: () => void
}

export function EditVendorDialog({
  vendor,
  isOpen,
  onClose,
  onVendorUpdated
}: EditVendorDialogProps) {
  const [formData, setFormData] = useState<Partial<Vendor>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (vendor) {
      setFormData(vendor)
      setTags(vendor.tags || [])
    }
  }, [vendor])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...((prev as any)[parent] || {}),
        [field]: value
      }
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!vendor) return

    try {
      setIsLoading(true)

      const updatedVendor = {
        ...formData,
        tags,
        lastUpdated: new Date().toISOString()
      }

      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedVendor),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update vendor')
      }

      const data = await response.json()
      toast.success('Vendor updated successfully')
      onVendorUpdated()
      onClose()

    } catch (error) {
      console.error('Error updating vendor:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update vendor')
    } finally {
      setIsLoading(false)
    }
  }

  if (!vendor || !formData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Vendor Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter vendor name"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select 
                  value={formData.type || ''} 
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Building Materials, Concrete Services"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status || ''} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="blacklisted">Blacklisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating || ''}
                  onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contact?.contactPerson || ''}
                  onChange={(e) => handleNestedInputChange('contact', 'contactPerson', e.target.value)}
                  placeholder="Contact person name"
                />
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.contact?.title || ''}
                  onChange={(e) => handleNestedInputChange('contact', 'title', e.target.value)}
                  placeholder="Job title"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact?.email || ''}
                  onChange={(e) => handleNestedInputChange('contact', 'email', e.target.value)}
                  placeholder="Email address"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.contact?.phone || ''}
                  onChange={(e) => handleNestedInputChange('contact', 'phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.contact?.address || ''}
                  onChange={(e) => handleNestedInputChange('contact', 'address', e.target.value)}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={formData.business?.licenseNumber || ''}
                  onChange={(e) => handleNestedInputChange('business', 'licenseNumber', e.target.value)}
                  placeholder="Business license number"
                />
              </div>

              <div>
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.business?.taxId || ''}
                  onChange={(e) => handleNestedInputChange('business', 'taxId', e.target.value)}
                  placeholder="Tax identification number"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.business?.website || ''}
                  onChange={(e) => handleNestedInputChange('business', 'website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="bondAmount">Bond Amount</Label>
                <Input
                  id="bondAmount"
                  type="number"
                  value={formData.business?.bondAmount || ''}
                  onChange={(e) => handleNestedInputChange('business', 'bondAmount', parseFloat(e.target.value) || 0)}
                  placeholder="Bond amount in USD"
                />
              </div>

              <div>
                <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                <Input
                  id="insuranceExpiry"
                  type="date"
                  value={formData.business?.insuranceExpiry ? new Date(formData.business.insuranceExpiry).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleNestedInputChange('business', 'insuranceExpiry', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this vendor"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Vendor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}