import { VendorsView } from '@/components/vendors/VendorsView'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function VendorsPage() {
  return (
    <DashboardLayout
      title="Vendors"
      subtitle="Manage your suppliers, contractors, and vendor relationships"
    >
      <VendorsView />
    </DashboardLayout>
  )
}
