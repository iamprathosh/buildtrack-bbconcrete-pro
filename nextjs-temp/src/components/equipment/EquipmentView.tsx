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
    lastService: Date
    nextService: Date
    serviceInterval: number // days
    maintenanceHistory: Array<{
      id: string
      date: Date
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
    uploadDate: Date
  }>
  purchaseDate: Date
  warrantyExpiry?: Date
  notes: string
  tags: string[]
  addedDate: Date
  lastUpdated: Date
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

export function EquipmentView() {
  const { user } = useUser()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([])
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

  // Mock data initialization
  useEffect(() => {
    const mockEquipment: Equipment[] = [
      {
        id: '1',
        name: 'CAT 320 Excavator',
        type: 'heavy_machinery',
        category: 'Excavator',
        model: '320',
        manufacturer: 'Caterpillar',
        serialNumber: 'CAT320-001',
        status: 'in_use',
        condition: 'good',
        location: 'Residential Complex A',
        assignedTo: 'John Smith',
        project: 'Residential Complex A',
        specifications: {
          power: '148 HP',
          capacity: '20 tons',
          dimensions: '9.5m x 3.2m x 3.1m',
          weight: '20,500 kg',
          fuelType: 'Diesel'
        },
        financial: {
          purchasePrice: 250000,
          currentValue: 180000,
          depreciationRate: 15,
          operatingCostPerHour: 75,
          maintenanceCostYTD: 12500
        },
        maintenance: {
          lastService: new Date('2024-01-10'),
          nextService: new Date('2024-02-10'),
          serviceInterval: 30,
          maintenanceHistory: [
            {
              id: '1',
              date: new Date('2024-01-10'),
              type: 'routine',
              description: 'Oil change, filter replacement, general inspection',
              cost: 850,
              performedBy: 'Mike Wilson'
            }
          ]
        },
        usage: {
          totalHours: 2845,
          hoursThisMonth: 142,
          utilizationRate: 78,
          fuelConsumption: 12.5
        },
        documents: [],
        purchaseDate: new Date('2022-06-15'),
        warrantyExpiry: new Date('2025-06-15'),
        notes: 'Primary excavator for foundation work. Regular maintenance required.',
        tags: ['heavy-duty', 'foundation', 'primary'],
        addedDate: new Date('2022-06-15'),
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Volvo A40G Dump Truck',
        type: 'vehicles',
        category: 'Dump Truck',
        model: 'A40G',
        manufacturer: 'Volvo',
        serialNumber: 'VOL-A40G-002',
        status: 'available',
        condition: 'excellent',
        location: 'Main Depot',
        specifications: {
          power: '402 HP',
          capacity: '40 tons',
          dimensions: '11.8m x 3.7m x 3.8m',
          weight: '25,200 kg',
          fuelType: 'Diesel'
        },
        financial: {
          purchasePrice: 450000,
          currentValue: 380000,
          depreciationRate: 12,
          operatingCostPerHour: 95,
          maintenanceCostYTD: 8900
        },
        maintenance: {
          lastService: new Date('2024-01-05'),
          nextService: new Date('2024-02-05'),
          serviceInterval: 30,
          maintenanceHistory: [
            {
              id: '1',
              date: new Date('2024-01-05'),
              type: 'routine',
              description: 'Hydraulic fluid change, brake inspection',
              cost: 1200,
              performedBy: 'Sarah Johnson'
            }
          ]
        },
        usage: {
          totalHours: 1950,
          hoursThisMonth: 89,
          utilizationRate: 65,
          fuelConsumption: 18.2
        },
        documents: [],
        purchaseDate: new Date('2023-03-20'),
        warrantyExpiry: new Date('2026-03-20'),
        notes: 'Newest addition to the fleet. Excellent condition.',
        tags: ['transport', 'materials', 'high-capacity'],
        addedDate: new Date('2023-03-20'),
        lastUpdated: new Date('2024-01-12')
      },
      {
        id: '3',
        name: 'Concrete Mixer CM-500',
        type: 'heavy_machinery',
        category: 'Concrete Mixer',
        model: 'CM-500',
        manufacturer: 'MixMaster',
        serialNumber: 'MM-CM500-003',
        status: 'maintenance',
        condition: 'fair',
        location: 'Service Center',
        specifications: {
          capacity: '500L',
          power: '11 HP',
          dimensions: '2.1m x 1.8m x 2.3m',
          weight: '450 kg',
          fuelType: 'Electric'
        },
        financial: {
          purchasePrice: 15000,
          currentValue: 8500,
          depreciationRate: 20,
          operatingCostPerHour: 8,
          maintenanceCostYTD: 2100
        },
        maintenance: {
          lastService: new Date('2024-01-14'),
          nextService: new Date('2024-01-28'),
          serviceInterval: 14,
          maintenanceHistory: [
            {
              id: '1',
              date: new Date('2024-01-14'),
              type: 'repair',
              description: 'Motor replacement, drum cleaning',
              cost: 680,
              performedBy: 'Tom Anderson'
            }
          ]
        },
        usage: {
          totalHours: 1456,
          hoursThisMonth: 0,
          utilizationRate: 45,
          fuelConsumption: 0
        },
        documents: [],
        purchaseDate: new Date('2021-08-10'),
        warrantyExpiry: new Date('2024-08-10'),
        notes: 'Currently under repair. Motor replaced recently.',
        tags: ['concrete', 'repair-needed', 'small-jobs'],
        addedDate: new Date('2021-08-10'),
        lastUpdated: new Date('2024-01-14')
      }
    ]

    setEquipment(mockEquipment)
    setFilteredEquipment(mockEquipment)
  }, [])

  // Apply filters
  useEffect(() => {
    const filtered = equipment.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.model.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.notes.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesType = filters.type === 'all' || item.type === filters.type
      const matchesCategory = filters.category === 'all' || item.category === filters.category
      const matchesStatus = filters.status === 'all' || item.status === filters.status
      const matchesCondition = filters.condition === 'all' || item.condition === filters.condition
      const matchesLocation = filters.location === 'all' || item.location === filters.location
      const matchesAssignedTo = filters.assignedTo === 'all' || item.assignedTo === filters.assignedTo

      // Maintenance status filter
      let matchesMaintenanceStatus = true
      if (filters.maintenanceStatus !== 'all') {
        const today = new Date()
        const daysTillNextService = differenceInDays(item.maintenance.nextService, today)
        
        if (filters.maintenanceStatus === 'overdue') {
          matchesMaintenanceStatus = daysTillNextService < 0
        } else if (filters.maintenanceStatus === 'due_soon') {
          matchesMaintenanceStatus = daysTillNextService >= 0 && daysTillNextService <= 7
        } else if (filters.maintenanceStatus === 'up_to_date') {
          matchesMaintenanceStatus = daysTillNextService > 7
        }
      }

      return matchesSearch && matchesType && matchesCategory && matchesStatus && 
             matchesCondition && matchesLocation && matchesAssignedTo && matchesMaintenanceStatus
    })

    setFilteredEquipment(filtered)
  }, [equipment, filters])

  // Calculate stats
  const stats = {
    totalEquipment: equipment.length,
    availableEquipment: equipment.filter(e => e.status === 'available').length,
    inUseEquipment: equipment.filter(e => e.status === 'in_use').length,
    maintenanceEquipment: equipment.filter(e => e.status === 'maintenance').length,
    totalValue: equipment.reduce((sum, e) => sum + e.financial.currentValue, 0),
    avgUtilization: equipment.length > 0 ? equipment.reduce((sum, e) => sum + e.usage.utilizationRate, 0) / equipment.length : 0,
    maintenanceOverdue: equipment.filter(e => differenceInDays(e.maintenance.nextService, new Date()) < 0).length
  }

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
            <div className="text-2xl font-bold">{stats.totalEquipment}</div>
            <p className="text-xs text-muted-foreground">All assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableEquipment}</div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inUseEquipment}</div>
            <p className="text-xs text-muted-foreground">Currently deployed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.maintenanceEquipment}</div>
            <p className="text-xs text-muted-foreground">Under service</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Asset value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Fleet efficiency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.maintenanceOverdue}</div>
            <p className="text-xs text-muted-foreground">Needs service</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <EquipmentFilters
        filters={filters}
        onFiltersChange={setFilters}
        equipment={equipment}
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
            equipment={filteredEquipment}
            selectedEquipment={selectedEquipment}
            onSelectedEquipmentChange={setSelectedEquipment}
            onEquipmentUpdate={(equipmentId, updates) => {
              setEquipment(prev => prev.map(item => 
                item.id === equipmentId ? { ...item, ...updates } : item
              ))
            }}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
            {filteredEquipment
              .sort((a, b) => differenceInDays(a.maintenance.nextService, new Date()) - differenceInDays(b.maintenance.nextService, new Date()))
              .map((item) => {
                const daysTillService = differenceInDays(item.maintenance.nextService, new Date())
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
                            <p className="font-medium">{format(item.maintenance.lastService, 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Next Service</p>
                            <p className="font-medium">{format(item.maintenance.nextService, 'MMM dd, yyyy')}</p>
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
                                        {format(record.date, 'MMM dd, yyyy')} • {record.performedBy}
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
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
            {filteredEquipment
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
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
            {filteredEquipment
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
        </TabsContent>
      </Tabs>

      {/* Add Equipment Dialog */}
      <AddEquipmentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onEquipmentAdded={(newEquipment) => {
          setEquipment(prev => [...prev, newEquipment])
          setIsAddDialogOpen(false)
        }}
      />
    </div>
  )
}