'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTable } from './UsersTable'
import { UsersFilters } from './UsersFilters'
import { AddUserDialog } from './AddUserDialog'
import { UserActivityTab } from './UserActivityTab'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import { 
  Plus,
  Users,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Settings,
  Mail,
  Phone,
  Calendar,
  Activity
} from 'lucide-react'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  role: 'admin' | 'manager' | 'supervisor' | 'worker' | 'contractor'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  department: string
  position: string
  permissions: {
    projects: 'read' | 'write' | 'admin' | 'none'
    inventory: 'read' | 'write' | 'admin' | 'none'
    procurement: 'read' | 'write' | 'admin' | 'none'
    reports: 'read' | 'write' | 'admin' | 'none'
    users: 'read' | 'write' | 'admin' | 'none'
    settings: 'read' | 'write' | 'admin' | 'none'
  }
  projects: string[]
  lastLogin?: Date
  joinDate: Date
  invitedBy?: string
  notes: string
  tags: string[]
  addedDate: Date
  lastUpdated: Date
}

export interface UserFilters {
  search: string
  role: string
  department: string
  status: string
  permissions: string
}

export function UsersView() {
  const { user: currentUser } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    department: 'all',
    status: 'all',
    permissions: 'all'
  })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        search: filters.search,
        role: filters.role,
        department: filters.department,
        status: filters.status,
        permissions: filters.permissions,
        includeStats: 'true'
      })

      const response = await fetch(`/api/users?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      setUsers(data.users)
      setFilteredUsers(data.users)
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    fetchUsers()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers()
    }, 300) // Debounce API calls

    return () => clearTimeout(timeoutId)
  }, [filters])

  // Update user handler
  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...data.user } : user
      ))
      setFilteredUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...data.user } : user
      ))

      // Refresh stats
      await fetchUsers()
    } catch (err) {
      console.error('Error updating user:', err)
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  // User added handler
  const handleUserAdded = (newUser: User) => {
    setUsers(prev => [...prev, newUser])
    setFilteredUsers(prev => [...prev, newUser])
    setIsAddDialogOpen(false)
    // Refresh to get updated stats
    fetchUsers()
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />
      case 'manager':
        return <Shield className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'pending':
        return 'text-orange-600'
      case 'suspended':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
          
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selectedUsers.length} selected
              </Badge>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full max-w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">All team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.adminUsers || 0}</div>
            <p className="text-xs text-muted-foreground">System administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentLogins || 0}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.departments || 0}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <UserX className="h-4 w-4" />
              <span className="font-medium">Error: {error}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={fetchUsers}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <UsersFilters
        filters={filters}
        onFiltersChange={setFilters}
        users={users}
      />

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium text-muted-foreground">Loading users...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Main Content */
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UsersTable
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onSelectedUsersChange={setSelectedUsers}
            onUserUpdate={handleUserUpdate}
          />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
            {filteredUsers
              .sort((a, b) => {
                const roleOrder = { admin: 0, manager: 1, supervisor: 2, worker: 3, contractor: 4 }
                return roleOrder[a.role] - roleOrder[b.role]
              })
              .map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {user.firstName} {user.lastName}
                          </CardTitle>
                          <CardDescription>
                            {user.position} • {user.department}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role}</span>
                        </Badge>
                        <Badge variant={
                          user.status === 'active' ? 'default' :
                          user.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Projects</p>
                          <p className="font-medium">{user.projects.length} assigned</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Login</p>
                          <p className="font-medium">
                            {user.lastLogin ? 
                             format(user.lastLogin, 'MMM dd, HH:mm') : 
                             'Never'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Join Date</p>
                          <p className="font-medium">{format(user.joinDate, 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Invited By</p>
                          <p className="font-medium">{user.invitedBy || 'System'}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-2">Permissions</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(user.permissions).map(([module, permission]) => (
                            <div key={module} className="flex items-center justify-between text-xs">
                              <span className="capitalize">{module}</span>
                              <Badge 
                                variant="outline" 
                                className={
                                  permission === 'admin' ? 'bg-purple-100 text-purple-800' :
                                  permission === 'write' ? 'bg-blue-100 text-blue-800' :
                                  permission === 'read' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {permission}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {user.projects.length > 0 && (
                        <div>
                          <p className="text-muted-foreground mb-2">Assigned Projects</p>
                          <div className="flex flex-wrap gap-1">
                            {user.projects.slice(0, 3).map((project) => (
                              <Badge key={project} variant="outline" className="text-xs">
                                {project}
                              </Badge>
                            ))}
                            {user.projects.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.projects.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <UserActivityTab />
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
            {filteredUsers
              .filter(user => user.status === 'pending')
              .map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {user.firstName} {user.lastName}
                        </CardTitle>
                        <CardDescription>
                          {user.email}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Role</p>
                          <p className="font-medium capitalize">{user.role}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Department</p>
                          <p className="font-medium">{user.department}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Invited</p>
                          <p className="font-medium">{format(user.joinDate, 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Invited By</p>
                          <p className="font-medium">{user.invitedBy}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Resend Invite
                        </Button>
                        <Button variant="destructive" size="sm">
                          <UserX className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {filteredUsers.filter(user => user.status === 'pending').length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-10">
                <div className="text-center">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="text-lg font-medium text-muted-foreground">No pending invitations</p>
                  <p className="text-sm text-muted-foreground">
                    All user invitations have been processed
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      )}

      {/* Add User Dialog */}
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  )
}
