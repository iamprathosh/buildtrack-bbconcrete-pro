'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ActivityRow {
  id: string
  type: 'inventory' | 'equipment' | 'project' | 'user' | 'system'
  title: string
  description: string
  user?: string
  timestamp: string
}

export function RecentActivityTable() {
  const [rows, setRows] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/equipment/transactions/recent?limit=20', { cache: 'no-store' })
      const data = await res.json()
      const mapped: ActivityRow[] = (data.activities || []).map((a: any) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        user: a.user,
        timestamp: a.timestamp,
      }))
      setRows(mapped)
    } catch (e) {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Inventory and equipment events</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2 pr-2">Type</th>
                <th className="py-2 pr-2">Title</th>
                <th className="py-2 pr-2">Details</th>
                <th className="py-2 pr-2">User</th>
                <th className="py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-4 text-muted-foreground" colSpan={5}>Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="py-4 text-muted-foreground" colSpan={5}>No recent activity</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 pr-2 capitalize">{r.type}</td>
                    <td className="py-2 pr-2">{r.title}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{r.description}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{r.user || '-'}</td>
                    <td className="py-2 text-muted-foreground">{r.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
