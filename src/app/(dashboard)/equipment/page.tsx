import { EquipmentView } from '@/components/equipment/EquipmentView'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function EquipmentPage() {
  return (
    <DashboardLayout
      title="Equipment"
      subtitle="Track and manage your construction equipment, machinery, and assets"
    >
      <EquipmentView />
    </DashboardLayout>
  )
}
