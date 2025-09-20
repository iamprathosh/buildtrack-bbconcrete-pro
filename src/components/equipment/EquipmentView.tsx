'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EquipmentTable } from './EquipmentTable'
import { EquipmentFilters } from './EquipmentFilters'
import { AddEquipmentDialog } from './AddEquipmentDialog'
import { useUser } from '@clerk/nextjs'
import { format, differenceInDays } from 'date-fns'
import { toast } from 'sonner'
import { 
  Plus,
  Wrench,
  Truck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Activity,
  DollarSign,
  TrendingUp,
  Settings
} from 'lucide-react'

export interface Equipment {
  id: string
  name: string
  type: 'heavy_machinery' | 'vehicles' | 'tools' | 'safety_equipment' | 'other'
  category: string
  model: string
  manufacturer: string
  serialNumber: string
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service' | 'retired'
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  location: string
  assignedTo?: string
  project?: string
  specifications: {
    power?: string
    capacity?: string
    dimensions?: string
    weight?: string
    fuelType?: string
  }
  financial: {
    purchasePrice: number
    currentValue: number
    depreciationRate: number
    operatingCostPerHour: number
    maintenanceCostYTD: number
  }
  maintenance: {
    lastService: string
    nextService: string
    serviceInterval: number // days
    maintenanceHistory: Array<{
      id: string
      date: string
      type: 'routine' | 'repair' | 'inspection'
      description: string
      cost: number
      performedBy: string
    }>
  }
  usage: {
    totalHours: number
    hoursThisMonth: number
    utilizationRate: number // percentage
    fuelConsumption: number
  }
  documents: Array<{
    id: string
    name: string
    type: 'manual' | 'warranty' | 'certificate' | 'inspection' | 'other'
    url: string
    uploadDate: string
  }>
  purchaseDate: string
  warrantyExpiry?: string
  notes: string
  tags: string[]
  addedDate: string
  lastUpdated: string
  createdBy?: string
  createdByName?: string
}

export interface EquipmentFilters {
  search: string
  type: string
  category: string
  status: string
  condition: string
  location: string
  assignedTo: string
  maintenanceStatus: string
}

export interface EquipmentStats {
  totalEquipment: number
  availableEquipment: number
  inUseEquipment: number
  maintenanceEquipment: number
  outOfServiceEquipment: number
  retiredEquipment: number
  totalValue: number
  totalPurchaseValue: number
  avgUtilization: number
  maintenanceOverdue: number
  totalMaintenanceCost: number
  totalOperatingCost: number
  heavyMachineryCount: number
  vehiclesCount: number
  toolsCount: number
  safetyEquipmentCount: number
  excellentCount: number
  goodCount: number
  fairCount: number
  poorCount: number
}

export function EquipmentView() {
  const { user } = useUser()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [stats, setStats] = useState<EquipmentStats | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [assignedUsers, setAssignedUsers] = useState<string[]>([])
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [filters, setFilters] = useState<EquipmentFilters>({
    search: '',
    type: 'all',
    category: 'all',
    status: 'all',
    condition: 'all',
    location: 'all',
    assignedTo: 'all',
    maintenanceStatus: 'all'
  })
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch equipment data from API
  const fetchEquipment = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value.toString())
        }
      })
      
      const response = await fetch(`/api/equipment?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch equipment')
      }
      
      const data = await response.json()
      setEquipment(data.equipment)
      setStats(data.stats)
      setCategories(data.categories)
      setLocations(data.locations)
      setAssignedUsers(data.assignedUsers)
      setManufacturers(data.manufacturers)
      
    } catch (error) {
      console.error('Error fetching equipment:', error)
      toast.error('Failed to load equipment data')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Initial data fetch
  useEffect(() => {
    fetchEquipment()
  }, []) // Remove filters dependency to avoid refetch on every filter change

  // Refetch data when filters change
  useEffect(() => {
    fetchEquipment()
  }, [filters])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
          
          {selectedEquipment.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selectedEquipment.length} selected
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

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 w-full max-w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.totalEquipment || 0}</div>
            <p className="text-xs text-muted-foreground">All assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? '...' : stats?.availableEquipment || 0}</div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{isLoading ? '...' : stats?.inUseEquipment || 0}</div>
            <p className="text-xs text-muted-foreground">Currently deployed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{isLoading ? '...' : stats?.maintenanceEquipment || 0}</div>
            <p className="text-xs text-muted-foreground">Under service</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(stats?.totalValue || 0)}</div>
            <p className="text-xs text-muted-foreground">Asset value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : (stats?.avgUtilization || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Fleet efficiency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{isLoading ? '...' : stats?.maintenanceOverdue || 0}</div>
            <p className="text-xs text-muted-foreground">Needs service</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <EquipmentFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        locations={locations}
        assignedUsers={assignedUsers}
        manufacturers={manufacturers}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <Tabs defaultValue="equipment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipment">All Equipment</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-4">
          <EquipmentTable
            equipment={equipment}
            selectedEquipment={selectedEquipment}
            onSelectedEquipmentChange={setSelectedEquipment}
            onEquipmentUpdate={fetchEquipment}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading maintenance data...</div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
              {equipment
              .sort((a, b) => differenceInDays(new Date(a.maintenance.nextService), new Date()) - differenceInDays(new Date(b.maintenance.nextService), new Date()))
              .map((item) => {
                const daysTillService = differenceInDays(new Date(item.maintenance.nextService), new Date())
                const isOverdue = daysTillService < 0
                const isDueSoon = daysTillService >= 0 && daysTillService <= 7
                
                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <CardDescription>
                            {item.manufacturer} {item.model} • {item.location}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            isOverdue ? 'destructive' :
                            isDueSoon ? 'secondary' : 'outline'
                          }>
                            {isOverdue ? 'Overdue' : 
                             isDueSoon ? 'Due Soon' : 'Up to Date'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Last Service</p>
                            <p className="font-medium">{format(new Date(item.maintenance.lastService), 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Next Service</p>
                            <p className="font-medium">{format(new Date(item.maintenance.nextService), 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Service Interval</p>
                            <p className="font-medium">{item.maintenance.serviceInterval} days</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">YTD Maintenance Cost</p>
                            <p className="font-medium">{formatCurrency(item.financial.maintenanceCostYTD)}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-muted-foreground mb-2">Recent Maintenance</p>
                          {item.maintenance.maintenanceHistory.length > 0 ? (
                            <div className="space-y-2">
                              {item.maintenance.maintenanceHistory.slice(0, 2).map((record) => (
                                <div key={record.id} className="p-3 bg-muted/50 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-sm">{record.description}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {format(new Date(record.date), 'MMM dd, yyyy')} • {record.performedBy}
                                      </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {formatCurrency(record.cost)}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No maintenance history</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Service
                          </Button>
                          <Button variant="outline" size="sm">
                            View History
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading utilization data...</div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
              {equipment
              .sort((a, b) => b.usage.utilizationRate - a.usage.utilizationRate)
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>
                          {item.manufacturer} {item.model}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        item.usage.utilizationRate >= 80 ? 'default' :
                        item.usage.utilizationRate >= 60 ? 'secondary' : 'outline'
                      }>
                        {item.usage.utilizationRate}% utilized
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Utilization Rate</span>
                          <span className="text-sm font-medium">{item.usage.utilizationRate}%</span>
                        </div>
                        <Progress value={item.usage.utilizationRate} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Hours</p>
                          <p className="font-medium">{item.usage.totalHours.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">This Month</p>
                          <p className="font-medium">{item.usage.hoursThisMonth}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Operating Cost/Hour</p>
                          <p className="font-medium">{formatCurrency(item.financial.operatingCostPerHour)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                      </div>

                      {item.assignedTo && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">
                            <strong>Assigned to:</strong> {item.assignedTo}
                            {item.project && <span> • {item.project}</span>}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading cost data...</div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
              {equipment
              .sort((a, b) => (b.financial.maintenanceCostYTD + b.usage.hoursThisMonth * b.financial.operatingCostPerHour) - 
                           (a.financial.maintenanceCostYTD + a.usage.hoursThisMonth * a.financial.operatingCostPerHour))
              .map((item) => {
                const monthlyOperatingCost = item.usage.hoursThisMonth * item.financial.operatingCostPerHour
                const totalMonthlyCost = monthlyOperatingCost + (item.financial.maintenanceCostYTD / 12)
                const depreciationPercentage = 100 - ((item.financial.currentValue / item.financial.purchasePrice) * 100)
                
                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <CardDescription>
                            {item.manufacturer} {item.model}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(totalMonthlyCost)}</p>
                          <p className="text-xs text-muted-foreground">Monthly cost</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Purchase Price</p>
                            <p className="font-medium">{formatCurrency(item.financial.purchasePrice)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Current Value</p>
                            <p className="font-medium">{formatCurrency(item.financial.currentValue)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Operating Cost/Hour</p>
                            <p className="font-medium">{formatCurrency(item.financial.operatingCostPerHour)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">YTD Maintenance</p>
                            <p className="font-medium">{formatCurrency(item.financial.maintenanceCostYTD)}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Depreciation</span>
                            <span className="text-sm font-medium">{depreciationPercentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={depreciationPercentage} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Cost Breakdown (This Month)</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Operating ({item.usage.hoursThisMonth}h)</span>
                              <span>{formatCurrency(monthlyOperatingCost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Maintenance (avg)</span>
                              <span>{formatCurrency(item.financial.maintenanceCostYTD / 12)}</span>
                            </div>
                            <div className="flex justify-between font-medium border-t pt-1">
                              <span>Total</span>
                              <span>{formatCurrency(totalMonthlyCost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Equipment Dialog */}
      <AddEquipmentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onEquipmentAdded={() => {
          fetchEquipment()
          setIsAddDialogOpen(false)
        }}
        categories={categories}
        locations={locations}
        manufacturers={manufacturers}
      />
    </div>
  )
}