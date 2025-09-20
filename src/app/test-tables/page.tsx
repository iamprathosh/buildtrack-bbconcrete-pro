import { TableTest } from '@/components/test/TableTest'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function TestTablesPage() {
  return (
    <DashboardLayout 
      title="Table Scrolling Test" 
      subtitle="Testing horizontal scrolling for tables"
    >
      <TableTest />
    </DashboardLayout>
  )
}