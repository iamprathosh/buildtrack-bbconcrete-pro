'use client'

import { useState, useEffect } from 'react'
import { ReportsFilters, FilterOptions } from './ReportsFilters'
import { ReportsDataTable, ReportDataRow } from './ReportsDataTable'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

export function ReportsView() {
  const { user } = useUser()
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: undefined,
    endDate: undefined,
    category: 'all'
  })
  const [data, setData] = useState<ReportDataRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch data when filters change
  useEffect(() => {
    fetchReportData()
  }, [filters])

  const fetchReportData = async () => {
    setIsLoading(true)
    try {
      const searchParams = new URLSearchParams()
      
      if (filters.startDate) {
        searchParams.append('startDate', filters.startDate.toISOString().split('T')[0])
      }
      if (filters.endDate) {
        searchParams.append('endDate', filters.endDate.toISOString().split('T')[0])
      }
      if (filters.category !== 'all') {
        searchParams.append('category', filters.category)
      }

      const response = await fetch(`/api/reports?${searchParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch report data')
      }

      const result = await response.json()
      setData(result.data || [])
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to fetch report data')
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      // Create CSV content
      const headers = [
        'Type',
        'Name', 
        'Description',
        'Date',
        'Quantity',
        'Unit',
        'Cost',
        'Status',
        'Maintenance Status',
        'Location/Project',
        'Category',
        'Created At'
      ]

      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          row.type,
          `"${row.name}"`,
          `"${row.description || ''}"`,
          row.date,
          row.quantity || '',
          row.unit || '',
          row.cost || '',
          row.status,
          row.maintenanceStatus || '',
          `"${row.location || row.project || ''}"`,
          row.category || '',
          row.createdAt
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      
      // Generate filename with timestamp and filter info
      const timestamp = new Date().toISOString().split('T')[0]
      const categoryText = filters.category !== 'all' ? `_${filters.category}` : ''
      const dateRange = filters.startDate && filters.endDate 
        ? `_${filters.startDate.toISOString().split('T')[0]}_to_${filters.endDate.toISOString().split('T')[0]}`
        : filters.startDate 
        ? `_from_${filters.startDate.toISOString().split('T')[0]}`
        : filters.endDate
        ? `_to_${filters.endDate.toISOString().split('T')[0]}`
        : ''
      
      link.setAttribute('download', `buildtrack_report${categoryText}${dateRange}_${timestamp}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('CSV export completed successfully')
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Failed to export CSV')
    }
  }

  const handleRefresh = () => {
    fetchReportData()
    toast.success('Data refreshed')
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Filters Section */}
      <ReportsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExportCSV={handleExportCSV}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Data Table Section */}
      <ReportsDataTable
        data={data}
        isLoading={isLoading}
        category={filters.category}
      />
    </div>
  )
}
