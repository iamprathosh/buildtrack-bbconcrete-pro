import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function InventoryDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Inventory Item</h1>
      <p className="text-sm text-muted-foreground">ID: {id}</p>
      <div>
        <Button asChild variant="outline">
          <Link href="/inventory">Back to Inventory</Link>
        </Button>
      </div>
    </div>
  )
}
