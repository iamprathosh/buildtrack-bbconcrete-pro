'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Vendor } from './VendorsView'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Save,
  X,
  CalendarIcon,
  Plus,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'

interface AddVendorDialogProps {
  isOpen: boolean
  onClose: () => void
  onVendorAdded: () => void
}

export function AddVendorDialog({
  isOpen,
  onClose,
  onVendorAdded
}: AddVendorDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'supplier' as const,
    category: '',
    status: 'pending' as const,
    rating: 0,
    contact: {
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
      title: ''
    },
    business: {
      licenseNumber: '',
      taxId: '',
      insuranceExpiry: undefined as Date | undefined,
      bondAmount: 0,
      website: ''
    },
    notes: ''
  })

  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Vendor name is required'
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required'
    }
    if (!formData.contact.email.trim()) {
      newErrors['contact.email'] = 'Email is required'
    }
    if (!formData.contact.phone.trim()) {
      newErrors['contact.phone'] = 'Phone is required'
    }
    if (!formData.contact.contactPerson.trim()) {
      newErrors['contact.contactPerson'] = 'Contact person is required'
    }
    if (!formData.contact.address.trim()) {
      newErrors['contact.address'] = 'Address is required'
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.contact.email && !emailRegex.test(formData.contact.email)) {
      newErrors['contact.email'] = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const vendorData = {
        name: formData.name,
        type: formData.type,
        category: formData.category,
        status: formData.status,
        rating: formData.rating,
        contact: formData.contact,
        business: {
          ...formData.business,
          insuranceExpiry: formData.business.insuranceExpiry?.toISOString(),
          bondAmount: formData.business.bondAmount || undefined
        },
        notes: formData.notes,
        tags: tags
      }

      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create vendor')
      }

      const data = await response.json()
      toast.success('Vendor created successfully')
      onVendorAdded()
      resetForm()

    } catch (error) {
      console.error('Error creating vendor:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create vendor')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'supplier',
      category: '',
      status: 'pending',
      rating: 0,
      contact: {
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        title: ''
      },
      business: {
        licenseNumber: '',
        taxId: '',
        insuranceExpiry: undefined,
        bondAmount: 0,
        website: ''
      },
      notes: ''
    })
    setTags([])
    setNewTag('')
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const getFieldError = (field: string) => {
    return errors[field]
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
          <DialogDescription>
            Register a new supplier, contractor, or consultant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vendor Name *</Label>
                  <Input
                    id="name"
                    placeholder="Company name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={getFieldError('name') ? 'border-destructive' : ''}
                  />
                  {getFieldError('name') && (
                    <p className="text-sm text-destructive">{getFieldError('name')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Building Materials, Concrete Services"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={getFieldError('category') ? 'border-destructive' : ''}
                  />
                  {getFieldError('category') && (
                    <p className="text-sm text-destructive">{getFieldError('category')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Initial Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    placeholder="Full name"
                    value={formData.contact.contactPerson}
                    onChange={(e) => handleInputChange('contact.contactPerson', e.target.value)}
                    className={getFieldError('contact.contactPerson') ? 'border-destructive' : ''}
                  />
                  {getFieldError('contact.contactPerson') && (
                    <p className="text-sm text-destructive">{getFieldError('contact.contactPerson')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title/Position</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Sales Manager, Project Manager"
                    value={formData.contact.title}
                    onChange={(e) => handleInputChange('contact.title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@company.com"
                    value={formData.contact.email}
                    onChange={(e) => handleInputChange('contact.email', e.target.value)}
                    className={getFieldError('contact.email') ? 'border-destructive' : ''}
                  />
                  {getFieldError('contact.email') && (
                    <p className="text-sm text-destructive">{getFieldError('contact.email')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    placeholder="+1-555-123-4567"
                    value={formData.contact.phone}
                    onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                    className={getFieldError('contact.phone') ? 'border-destructive' : ''}
                  />
                  {getFieldError('contact.phone') && (
                    <p className="text-sm text-destructive">{getFieldError('contact.phone')}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Complete business address"
                    value={formData.contact.address}
                    onChange={(e) => handleInputChange('contact.address', e.target.value)}
                    className={getFieldError('contact.address') ? 'border-destructive' : ''}
                    rows={3}
                  />
                  {getFieldError('contact.address') && (
                    <p className="text-sm text-destructive">{getFieldError('contact.address')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Details (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="Business license number"
                    value={formData.business.licenseNumber}
                    onChange={(e) => handleInputChange('business.licenseNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    placeholder="Federal tax ID number"
                    value={formData.business.taxId}
                    onChange={(e) => handleInputChange('business.taxId', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Insurance Expiry</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !formData.business.insuranceExpiry && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.business.insuranceExpiry ? (
                          format(formData.business.insuranceExpiry, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.business.insuranceExpiry}
                        onSelect={(date) => handleInputChange('business.insuranceExpiry', date)}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bondAmount">Bond Amount ($)</Label>
                  <Input
                    id="bondAmount"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.business.bondAmount || ''}
                    onChange={(e) => handleInputChange('business.bondAmount', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.company.com"
                    value={formData.business.website}
                    onChange={(e) => handleInputChange('business.website', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags and Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add a tag (e.g., reliable, bulk-orders)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this vendor..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Creating...' : 'Add Vendor'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}