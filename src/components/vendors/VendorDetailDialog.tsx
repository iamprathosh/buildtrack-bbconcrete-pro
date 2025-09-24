'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Vendor } from './VendorsView'
import { format } from 'date-fns'
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  Edit,
  Building2,
  Shield,
  FileText,
  DollarSign
} from 'lucide-react'

interface VendorDetailDialogProps {
  vendor: Vendor | null
  isOpen: boolean
  onClose: () => void
  onEdit: (vendor: Vendor) => void
}

export function VendorDetailDialog({
  vendor,
  isOpen,
  onClose,
  onEdit
}: VendorDetailDialogProps) {
  if (!vendor) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-orange-100 text-orange-800',
      blacklisted: 'bg-red-100 text-red-800'
    } as const

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      supplier: 'bg-blue-100 text-blue-800',
      contractor: 'bg-purple-100 text-purple-800',
      consultant: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    } as const

    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {type}
      </Badge>
    )
  }

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm ml-2">({rating})</span>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{vendor.name}</DialogTitle>
              <div className="flex items-center space-x-2 mt-2">
                {getTypeBadge(vendor.type)}
                {getStatusBadge(vendor.status)}
              </div>
            </div>
            <Button onClick={() => onEdit(vendor)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{vendor.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                {getRatingStars(vendor.rating)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Added Date</p>
                <p className="font-medium">{format(new Date(vendor.addedDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{format(new Date(vendor.lastUpdated), 'MMM dd, yyyy')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{vendor.contact.contactPerson}</p>
                  <p className="text-sm text-muted-foreground">{vendor.contact.title}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{vendor.contact.email}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{vendor.contact.phone}</span>
                  </div>
                </div>
                <div>
                  {vendor.business.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={vendor.business.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">{vendor.contact.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Business Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.business.licenseNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{vendor.business.licenseNumber}</p>
                </div>
              )}
              {vendor.business.taxId && (
                <div>
                  <p className="text-sm text-muted-foreground">Tax ID</p>
                  <p className="font-medium">{vendor.business.taxId}</p>
                </div>
              )}
              {vendor.business.insuranceExpiry && (
                <div>
                  <p className="text-sm text-muted-foreground">Insurance Expiry</p>
                  <p className="font-medium">
                    {format(new Date(vendor.business.insuranceExpiry), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              {vendor.business.bondAmount && (
                <div>
                  <p className="text-sm text-muted-foreground">Bond Amount</p>
                  <p className="font-medium">{formatCurrency(vendor.business.bondAmount)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{vendor.performance.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(vendor.performance.totalValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On-Time Rate</p>
                <p className="text-2xl font-bold">{vendor.performance.onTimeDeliveryRate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quality Rating</p>
                <p className="text-2xl font-bold">{vendor.performance.qualityRating}/5</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
                <p className="text-xl font-bold">{vendor.performance.avgDeliveryTime} days</p>
              </div>
            </CardContent>
          </Card>

          {/* Tags and Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendor.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {vendor.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{vendor.notes}</p>
                  </div>
                </div>
              )}

              {vendor.createdByName && (
                <div>
                  <p className="text-sm text-muted-foreground">Created by</p>
                  <p className="font-medium">{vendor.createdByName}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}