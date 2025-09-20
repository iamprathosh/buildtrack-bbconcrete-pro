import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ReportsView } from '@/components/reports/ReportsView'

export default function ReportsPage() {
  return (
    <DashboardLayout 
      title="Reports & Analytics" 
      subtitle="Comprehensive business intelligence and project analytics"
    >
      <ReportsView />
    </DashboardLayout>
  )
}