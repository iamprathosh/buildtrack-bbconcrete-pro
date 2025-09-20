'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { Vendor } from './VendorsView'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Shield
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface VendorsTableProps {
  vendors: Vendor[]
  selectedVendors: string[]
  onSelectedVendorsChange: (selected: string[]) => void
  onVendorUpdate: (vendorId: string, updates: Partial<Vendor>) => void
}

export function VendorsTable({
  vendors,
  selectedVendors,
  onSelectedVendorsChange,
  onVendorUpdate
}: VendorsTableProps) {
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedVendorsChange(vendors.map(vendor => vendor.id))
    } else {
      onSelectedVendorsChange([])
    }
  }

  const handleSelectVendor = (vendorId: string, checked: boolean) => {
    if (checked) {
      onSelectedVendorsChange([...selectedVendors, vendorId])
    } else {
      onSelectedVendorsChange(selectedVendors.filter(id => id !== vendorId))
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      pending: 'outline',
      blacklisted: 'destructive'
    } as const

    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-orange-100 text-orange-800',
      blacklisted: 'bg-red-100 text-red-800'
    } as const

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'outline'} 
        className={colors[status as keyof typeof colors]}
      >
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
      <Badge 
        variant="outline" 
        className={colors[type as keyof typeof colors]}
      >
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
            className={`h-3 w-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm ml-1">({rating})</span>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (vendors.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No vendors found</p>
            <p className="text-sm text-muted-foreground">
              Add your first vendor to get started
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Directory</CardTitle>
        <CardDescription>
          Manage your supplier and contractor relationships
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <ScrollArea className="w-full">
            <div className="min-w-[1200px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedVendors.length === vendors.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="min-w-[200px]">Vendor</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[150px]">Category</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Rating</TableHead>
                    <TableHead className="min-w-[150px]">Contact</TableHead>
                    <TableHead className="min-w-[120px]">Performance</TableHead>
                    <TableHead className="min-w-[100px]">Location</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <>
                      <TableRow key={vendor.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedVendors.includes(vendor.id)}
                            onCheckedChange={(checked) => 
                              handleSelectVendor(vendor.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Button 
                              variant="link" 
                              className="p-0 h-auto font-medium"
                              onClick={() => setExpandedVendor(
                                expandedVendor === vendor.id ? null : vendor.id
                              )}
                            >
                              {vendor.name}
                            </Button>
                            <p className="text-sm text-muted-foreground">
                              {vendor.contact.contactPerson}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(vendor.type)}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{vendor.category}</p>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(vendor.status)}
                        </TableCell>
                        <TableCell>
                          {getRatingStars(vendor.rating)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[100px]">{vendor.contact.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{vendor.contact.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Orders:</span>
                              <span className="font-medium">{vendor.performance.totalOrders}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Value:</span>
                              <span className="font-medium">{formatCurrency(vendor.performance.totalValue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">On-time:</span>
                              <span className="font-medium">{vendor.performance.onTimeDeliveryRate}%</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[80px]">
                              {vendor.contact.address.split(',').pop()?.trim()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Vendor
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {vendor.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => onVendorUpdate(vendor.id, { status: 'active' })}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => onVendorUpdate(vendor.id, { status: 'blacklisted' })}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {vendor.status === 'active' && (
                                <DropdownMenuItem 
                                  onClick={() => onVendorUpdate(vendor.id, { status: 'inactive' })}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      {expandedVendor === vendor.id && (
                        <TableRow>
                          <TableCell colSpan={10} className="p-0">
                            <div className="p-6 bg-muted/20 border-t">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-3">Contact Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-start space-x-2">
                                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                      <div>
                                        <p className="font-medium">{vendor.contact.email}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                      <div>
                                        <p className="font-medium">{vendor.contact.phone}</p>
                                        <p className="text-muted-foreground">
                                          {vendor.contact.contactPerson} - {vendor.contact.title}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                      <div>
                                        <p className="font-medium">{vendor.contact.address}</p>
                                      </div>
                                    </div>
                                    {vendor.business.website && (
                                      <div className="flex items-start space-x-2">
                                        <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div>
                                          <a 
                                            href={vendor.business.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="font-medium text-blue-600 hover:underline"
                                          >
                                            {vendor.business.website}
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-3">Business Details</h4>
                                  <div className="space-y-2 text-sm">
                                    {vendor.business.licenseNumber && (
                                      <div>
                                        <p className="text-muted-foreground">License Number</p>
                                        <p className="font-medium">{vendor.business.licenseNumber}</p>
                                      </div>
                                    )}
                                    {vendor.business.taxId && (
                                      <div>
                                        <p className="text-muted-foreground">Tax ID</p>
                                        <p className="font-medium">{vendor.business.taxId}</p>
                                      </div>
                                    )}
                                    {vendor.business.insuranceExpiry && (
                                      <div>
                                        <p className="text-muted-foreground">Insurance Expiry</p>
                                        <p className="font-medium">
                                          {format(vendor.business.insuranceExpiry, 'MMM dd, yyyy')}
                                        </p>
                                      </div>
                                    )}
                                    {vendor.business.bondAmount && (
                                      <div>
                                        <p className="text-muted-foreground">Bond Amount</p>
                                        <p className="font-medium">{formatCurrency(vendor.business.bondAmount)}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-3">Performance & Tags</h4>
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">Avg Delivery</p>
                                        <p className="font-medium">{vendor.performance.avgDeliveryTime} days</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Quality</p>
                                        <p className="font-medium">{vendor.performance.qualityRating}/5</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <p className="text-muted-foreground mb-2">Tags</p>
                                      <div className="flex flex-wrap gap-1">
                                        {vendor.tags.map((tag) => (
                                          <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    {vendor.notes && (
                                      <div>
                                        <p className="text-muted-foreground mb-2">Notes</p>
                                        <div className="p-3 bg-background rounded-lg border">
                                          <p className="text-sm">{vendor.notes}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}