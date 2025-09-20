import { UsersView } from '@/components/users/UsersView'

export default function UsersPage() {
  return (
    <div className="p-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage team members, roles, and access permissions
          </p>
        </div>
        <UsersView />
      </div>
    </div>
  )
}