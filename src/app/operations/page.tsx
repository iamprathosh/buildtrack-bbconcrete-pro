import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { OperationsView } from '@/components/operations/OperationsView'

export default function OperationsPage() {
  return (
    <DashboardLayout title="Operations" subtitle="Inventory transactions and stock management">
      <OperationsView />
    </DashboardLayout>
  )
}