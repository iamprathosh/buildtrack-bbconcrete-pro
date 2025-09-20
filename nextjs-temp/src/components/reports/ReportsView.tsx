'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { ReportsFilters } from './ReportsFilters'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Building2,
  FileText,
  Download,
  RefreshCw,
  PieChart,
  LineChart
} from 'lucide-react'

interface ReportData {
  id: string
  name: string
  type: 'financial' | 'project' | 'inventory' | 'procurement' | 'custom'
  description: string
  lastUpdated: Date
  status: 'ready' | 'generating' | 'error'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom'
}

interface AnalyticsData {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalRevenue: number
  totalCosts: number
  profitMargin: number
  inventoryValue: number
  pendingOrders: number
  monthlyTrend: Array<{
    month: string
    revenue: number
    costs: number
    projects: number
  }>
}

export function ReportsView() {
  const { user } = useUser()
  const [reports, setReports] = useState<ReportData[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<DateRange | undefined>()
  const [selectedReportType, setSelectedReportType] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock data initialization
  useEffect(() => {
    const mockReports: ReportData[] = [
      {
        id: '1',
        name: 'Monthly Financial Summary',
        type: 'financial',
        description: 'Comprehensive financial overview including revenue, costs, and profit margins',
        lastUpdated: new Date('2024-01-16'),
        status: 'ready',
        frequency: 'monthly'
      },
      {
        id: '2',
        name: 'Project Performance Dashboard',
        type: 'project',
        description: 'Project completion rates, budget utilization, and timeline analysis',
        lastUpdated: new Date('2024-01-15'),
        status: 'ready',
        frequency: 'weekly'
      },
      {
        id: '3',
        name: 'Inventory Valuation Report',
        type: 'inventory',
        description: 'Current inventory value, turnover rates, and stock optimization',
        lastUpdated: new Date('2024-01-14'),
        status: 'generating',
        frequency: 'weekly'
      },
      {
        id: '4',
        name: 'Procurement Analysis',
        type: 'procurement',
        description: 'Vendor performance, purchase order trends, and cost savings',
        lastUpdated: new Date('2024-01-12'),
        status: 'ready',
        frequency: 'monthly'
      },
      {
        id: '5',
        name: 'Custom ROI Analysis',
        type: 'custom',
        description: 'Return on investment analysis for specific project categories',
        lastUpdated: new Date('2024-01-10'),
        status: 'error',
        frequency: 'quarterly'
      }
    ]

    const mockAnalytics: AnalyticsData = {
      totalProjects: 24,
      activeProjects: 8,
      completedProjects: 16,
      totalRevenue: 2450000,
      totalCosts: 1890000,
      profitMargin: 22.9,
      inventoryValue: 450000,
      pendingOrders: 12,
      monthlyTrend: [
        { month: 'Jul', revenue: 180000, costs: 140000, projects: 3 },
        { month: 'Aug', revenue: 220000, costs: 165000, projects: 4 },
        { month: 'Sep', revenue: 195000, costs: 152000, projects: 2 },
        { month: 'Oct', revenue: 240000, costs: 185000, projects: 5 },
        { month: 'Nov', revenue: 210000, costs: 168000, projects: 3 },
        { month: 'Dec', revenue: 285000, costs: 215000, projects: 4 },
        { month: 'Jan', revenue: 320000, costs: 245000, projects: 3 }
      ]
    }

    setReports(mockReports)
    setAnalytics(mockAnalytics)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getReportTypeColor = (type: ReportData['type']) => {
    const colors = {
      'financial': 'bg-green-100 text-green-800',
      'project': 'bg-blue-100 text-blue-800',
      'inventory': 'bg-orange-100 text-orange-800',
      'procurement': 'bg-purple-100 text-purple-800',
      'custom': 'bg-gray-100 text-gray-800'
    }
    return colors[type]
  }

  const getStatusIcon = (status: ReportData['status']) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ready</Badge>
      case 'generating':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Generating
        </Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
    }
  }

  const handleGenerateReport = (reportId: string) => {
    setIsGenerating(true)
    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'ready' as const, lastUpdated: new Date() }
          : report
      ))
      setIsGenerating(false)
    }, 2000)
  }

  const filteredReports = reports.filter(report => 
    selectedReportType === 'all' || report.type === selectedReportType
  )

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="procurement">Procurement</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <DatePickerWithRange
            date={selectedTimeRange}
            onDateChange={setSelectedTimeRange}
            placeholder="Select date range..."
            className="w-64"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full max-w-full">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last quarter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.profitMargin}%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.activeProjects}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalProjects} total projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(analytics.inventoryValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.pendingOrders} pending orders
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
            {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getReportTypeColor(report.type)}`}>
                        {report.type}
                      </span>
                      {getStatusIcon(report.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Last updated: {format(report.lastUpdated, 'MMM dd, yyyy')}</span>
                      <span>Frequency: {report.frequency}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {report.status === 'ready' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                          </Button>
                        </>
                      )}
                      {report.status === 'error' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={isGenerating}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                          Regenerate
                        </Button>
                      )}
                      {report.status === 'generating' && (
                        <Button size="sm" disabled>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
              {/* Monthly Trend Chart Placeholder */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Monthly Performance Trend
                  </CardTitle>
                  <CardDescription>Revenue, costs, and project completion over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium text-muted-foreground">Chart Placeholder</p>
                      <p className="text-sm text-muted-foreground">Interactive chart would be rendered here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Project Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-medium">{analytics.completedProjects}</span>
                    </div>
                    <Progress value={(analytics.completedProjects / analytics.totalProjects) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active</span>
                      <span className="text-sm font-medium">{analytics.activeProjects}</span>
                    </div>
                    <Progress value={(analytics.activeProjects / analytics.totalProjects) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Revenue</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(analytics.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Costs</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(analytics.totalCosts)}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Net Profit</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(analytics.totalRevenue - analytics.totalCosts)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create customized reports based on your specific needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md" 
                      placeholder="Enter report name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial">Financial Analysis</SelectItem>
                        <SelectItem value="project">Project Performance</SelectItem>
                        <SelectItem value="inventory">Inventory Report</SelectItem>
                        <SelectItem value="custom">Custom Query</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <Card className="p-4 cursor-pointer hover:bg-muted/50">
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-medium">Financial Report</h3>
                      <p className="text-xs text-muted-foreground">Revenue, costs, profit analysis</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4 cursor-pointer hover:bg-muted/50">
                    <div className="text-center">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-medium">Project Report</h3>
                      <p className="text-xs text-muted-foreground">Timeline, budget, completion</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4 cursor-pointer hover:bg-muted/50">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <h3 className="font-medium">Inventory Report</h3>
                      <p className="text-xs text-muted-foreground">Stock levels, valuation, trends</p>
                    </div>
                  </Card>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Preview</Button>
                  <Button>Create Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}