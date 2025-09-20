import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { InventoryView } from '@/components/inventory/InventoryView'

export default function InventoryPage() {
  return (
    <DashboardLayout title="Inventory" subtitle="Manage and monitor construction materials and supplies">
      <InventoryView />
    </DashboardLayout>
  )
}