import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/database-server'

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const since = new Date()
    since.setDate(since.getDate() - 7)

    // Fetch last 7 days transactions
    const { data, error } = await (supabaseServer as any)
      .from('simple_inventory_transactions')
      .select('transaction_type, quantity, total_value, done_at, created_at')
      .gte('done_at', since.toISOString())

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
    }

    const summary = {
      IN: { quantity: 0, total_value: 0, count: 0 },
      OUT: { quantity: 0, total_value: 0, count: 0 },
      RETURN: { quantity: 0, total_value: 0, count: 0 }
    } as Record<'IN'|'OUT'|'RETURN', { quantity: number, total_value: number, count: number }>

    ;(data || []).forEach((tx: any) => {
      const t = (tx.transaction_type || '').toUpperCase()
      if (t === 'IN' || t === 'OUT' || t === 'RETURN') {
        summary[t].quantity += Number(tx.quantity || 0)
        summary[t].total_value += Number(tx.total_value || 0)
        summary[t].count += 1
      }
    })

    return NextResponse.json({ period: 'last_7_days', summary })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
