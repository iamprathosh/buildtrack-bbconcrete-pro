'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Calendar,
  DollarSign,
  Percent,
  Hash,
  X,
  RefreshCw
} from 'lucide-react'

interface ReportDetail {
  id: string
  name: string
  type: 'financial' | 'project' | 'inventory' | 'procurement' | 'custom'
  description: string
  data: any
  generatedAt: string
  tableData?: {
    columns: Array<{
      key: string
      header: string
      type?: 'text' | 'number' | 'currency' | 'percentage' | 'date'
    }>
    rows: Array<Record<string, any>>
  }
  chartData?: {
    type: 'line' | 'bar' | 'pie' | 'area'
    data: any[]
    labels: string[]
  }
  summary?: {
    title: string
    description: string
    metrics: Array<{
      label: string
      value: string | number
      trend?: 'up' | 'down' | 'stable'
      trendValue?: string
    }>
  }
}

interface ReportDetailDialogProps {
  reportId: string | null
  isOpen: boolean
  onClose: () => void
  displayMode?: 'dialog' | 'sheet'
}

export function ReportDetailDialog({ 
  reportId, 
  isOpen, 
  onClose,
  displayMode = 'dialog' 
}: ReportDetailDialogProps) {
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && reportId) {
      fetchReportDetail()
    }
  }, [isOpen, reportId])

  const fetchReportDetail = async () => {
    if (!reportId) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/reports/${reportId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch report details')
      }
      const data = await response.json()
      setReport(data.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatCellValue = (value: any, type?: string) => {
    if (value === null || value === undefined) return '-'
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Number(value))
      case 'percentage':
        return `${value}%`
      case 'date':
        return format(new Date(value), 'MMM dd, yyyy')
      case 'number':
        return Number(value).toLocaleString()
      default:
        return value
    }
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial':
        return <DollarSign className="h-5 w-5 text-green-600" />
      case 'project':
        return <BarChart3 className="h-5 w-5 text-blue-600" />
      case 'inventory':
        return <Hash className="h-5 w-5 text-orange-600" />
      case 'procurement':
        return <FileText className="h-5 w-5 text-purple-600" />
      default:
        return <PieChart className="h-5 w-5 text-gray-600" />
    }
  }

  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case 'line':
        return <LineChart className="h-4 w-4" />
      case 'bar':
        return <BarChart3 className="h-4 w-4" />
      case 'pie':
        return <PieChart className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading report details...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchReportDetail} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    if (!report) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No report data available</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Report Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              {getTypeIcon(report.type)}
              <h2 className="text-2xl font-bold">{report.name}</h2>
              <Badge variant="secondary" className="capitalize">
                {report.type}
              </Badge>
            </div>
            <p className="text-muted-foreground">{report.description}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Generated: {format(new Date(report.generatedAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="data">Data Table</TabsTrigger>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            {report.summary && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{report.summary.title}</h3>
                  <p className="text-muted-foreground">{report.summary.description}</p>
                </div>
                
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {report.summary.metrics.map((metric, index) => (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {metric.label}
                        </CardTitle>
                        {getTrendIcon(metric.trend)}
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {typeof metric.value === 'number' && metric.label.toLowerCase().includes('revenue')
                            ? formatCellValue(metric.value, 'currency')
                            : metric.value}
                        </div>
                        {metric.trendValue && (
                          <p className={`text-xs ${
                            metric.trend === 'up' 
                              ? 'text-green-600' 
                              : metric.trend === 'down' 
                              ? 'text-red-600' 
                              : 'text-muted-foreground'
                          }`}>
                            {metric.trendValue} from last period
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Data Table Tab */}
          <TabsContent value="data" className="space-y-4">
            {report.tableData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Detailed Data</span>
                  </CardTitle>
                  <CardDescription>
                    Complete dataset with {report.tableData.rows.length} records
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {report.tableData.columns.map((column) => (
                            <TableHead key={column.key} className="font-semibold">
                              {column.header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.tableData.rows.map((row, index) => (
                          <TableRow key={index}>
                            {report.tableData!.columns.map((column) => (
                              <TableCell key={column.key}>
                                {formatCellValue(row[column.key], column.type)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Chart Tab */}
          <TabsContent value="chart" className="space-y-4">
            {report.chartData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getChartIcon(report.chartData.type)}
                    <span>Chart Visualization</span>
                  </CardTitle>
                  <CardDescription>
                    {report.chartData.type.charAt(0).toUpperCase() + report.chartData.type.slice(1)} chart representation of the data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
                    <div className="text-center">
                      {getChartIcon(report.chartData.type)}
                      <p className="text-lg font-medium text-muted-foreground mt-2">
                        {report.chartData.type.charAt(0).toUpperCase() + report.chartData.type.slice(1)} Chart
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Interactive chart would be rendered here
                      </p>
                      <div className="mt-4 text-xs text-muted-foreground">
                        <p>Data points: {report.chartData.data.length}</p>
                        <p>Labels: {report.chartData.labels.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (displayMode === 'sheet') {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="min-w-[800px] sm:max-w-[900px] overflow-y-auto">
          <SheetHeader className="space-y-2">
            <SheetTitle>{report?.name || 'Report Details'}</SheetTitle>
            <SheetDescription>
              {report?.description || 'Detailed report analysis and data'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {renderContent()}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center justify-between">
            <span>{report?.name || 'Report Details'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}