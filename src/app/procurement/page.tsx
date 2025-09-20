import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ProcurementView } from '@/components/procurement/ProcurementView'

export default function ProcurementPage() {
  return (
    <DashboardLayout 
      title="Procurement Management" 
      subtitle="Purchase orders, supplier management, and procurement workflows"
    >
      <ProcurementView />
    </DashboardLayout>
  )
}