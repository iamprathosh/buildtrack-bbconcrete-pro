import { UsersView } from '@/components/users/UsersView'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function UsersPage() {
  return (
    <DashboardLayout
      title="Users"
      subtitle="Manage team members, roles, and access permissions"
    >
      <UsersView />
    </DashboardLayout>
  )
}
