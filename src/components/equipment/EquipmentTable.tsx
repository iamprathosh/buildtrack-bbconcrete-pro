'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, RefreshCw } from 'lucide-react'
import { useDatabase } from '@/lib/database'
import type { Equipment as DbEquipment } from '@/types/database'
import { EquipmentDetailsSheet } from './EquipmentDetailsSheet'

interface EquipmentTableProps {
  equipment: any[]
  selectedEquipment: string[]
  onSelectedEquipmentChange: (selected: string[]) => void
  onEquipmentUpdate?: () => Promise<void>
  isLoading?: boolean
}

export function EquipmentTable({}: EquipmentTableProps) {
  const { db, isReady } = useDatabase()
  const [rows, setRows] = useState<DbEquipment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<DbEquipment | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const load = async () => {
    if (!isReady) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await db
        .from('equipment')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, 9999)

      if (error) throw error
      setRows(data || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.equipment_number || '').toLowerCase().includes(q) ||
      (r.model || '').toLowerCase().includes(q) ||
      (r.serial_number || '').toLowerCase().includes(q) ||
      (r.location || '').toLowerCase().includes(q)
    )
  }, [rows, search])

  const statusBadge = (status: DbEquipment['status']) => {
    const map: Record<DbEquipment['status'], { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      available: { label: 'Available', variant: 'default' },
      checked_out: { label: 'Checked Out', variant: 'secondary' },
      maintenance: { label: 'Maintenance', variant: 'outline' },
      retired: { label: 'Retired', variant: 'destructive' },
    }
    const s = map[status]
    return <Badge variant={s.variant}>{s.label}</Badge>
  }

  return (
    <Card>
      <CardHeader className="flex items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <CardTitle>Equipment Directory</CardTitle>
          <CardDescription>Records from your database</CardDescription>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search equipment..."
            className="w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline" size="icon" onClick={load} disabled={loading} aria-label="Refresh">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 text-sm text-red-600">{error}</div>
        )}
        <div className="w-full overflow-x-auto">
          <Table>
            <TableCaption>
              {loading ? 'Loading equipment...' : `Showing ${filtered.length} record(s)`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Equipment #</TableHead>
                <TableHead className="whitespace-nowrap">Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Checked Out To</TableHead>
                <TableHead>Checked Out Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No equipment found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((item) => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => { setSelected(item); setDetailsOpen(true) }}>
                  <TableCell className="font-medium">{item.equipment_number}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category || '-'}</TableCell>
                  <TableCell>{item.model || '-'}</TableCell>
                  <TableCell>{item.serial_number || '-'}</TableCell>
                  <TableCell>{statusBadge(item.status)}</TableCell>
                  <TableCell>{item.location || '-'}</TableCell>
                  <TableCell>{item.checked_out_to || '-'}</TableCell>
                  <TableCell>{item.checked_out_date ? new Date(item.checked_out_date).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <EquipmentDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        equipment={selected}
        onChanged={load}
      />
    </Card>
  )
}
