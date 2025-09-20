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

  // Mock data initialization
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@buildtrack.com',
        phone: '+1-555-123-4567',
        avatar: undefined,
        role: 'admin',
        status: 'active',
        department: 'Management',
        position: 'Project Director',
        permissions: {
          projects: 'admin',
          inventory: 'admin',
          procurement: 'admin',
          reports: 'admin',
          users: 'admin',
          settings: 'admin'
        },
        projects: ['Residential Complex A', 'Bridge Construction', 'Office Building B'],
        lastLogin: new Date('2024-01-16T09:15:00'),
        joinDate: new Date('2022-03-15'),
        invitedBy: 'System',
        notes: 'Company founder and primary administrator',
        tags: ['founder', 'admin', 'decision-maker'],
        addedDate: new Date('2022-03-15'),
        lastUpdated: new Date('2024-01-16')
      },
      {
        id: '2',
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@buildtrack.com',
        phone: '+1-555-987-6543',
        avatar: undefined,
        role: 'manager',
        status: 'active',
        department: 'Construction',
        position: 'Site Manager',
        permissions: {
          projects: 'admin',
          inventory: 'write',
          procurement: 'write',
          reports: 'write',
          users: 'read',
          settings: 'none'
        },
        projects: ['Residential Complex A', 'Office Building B'],
        lastLogin: new Date('2024-01-16T08:30:00'),
        joinDate: new Date('2022-06-20'),
        invitedBy: 'John Smith',
        notes: 'Experienced site manager with excellent track record',
        tags: ['experienced', 'reliable', 'leadership'],
        addedDate: new Date('2022-06-20'),
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: '3',
        firstName: 'Robert',
        lastName: 'Davis',
        email: 'robert.davis@buildtrack.com',
        phone: '+1-555-456-7890',
        avatar: undefined,
        role: 'supervisor',
        status: 'active',
        department: 'Operations',
        position: 'Procurement Supervisor',
        permissions: {
          projects: 'read',
          inventory: 'write',
          procurement: 'admin',
          reports: 'read',
          users: 'none',
          settings: 'none'
        },
        projects: ['Bridge Construction'],
        lastLogin: new Date('2024-01-15T16:45:00'),
        joinDate: new Date('2023-01-10'),
        invitedBy: 'John Smith',
        notes: 'Handles all procurement and vendor relations',
        tags: ['procurement', 'vendor-relations', 'organized'],
        addedDate: new Date('2023-01-10'),
        lastUpdated: new Date('2024-01-14')
      },
      {
        id: '4',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@buildtrack.com',
        phone: '+1-555-321-9876',
        avatar: undefined,
        role: 'worker',
        status: 'active',
        department: 'Construction',
        position: 'Senior Equipment Operator',
        permissions: {
          projects: 'read',
          inventory: 'read',
          procurement: 'none',
          reports: 'none',
          users: 'none',
          settings: 'none'
        },
        projects: ['Residential Complex A'],
        lastLogin: new Date('2024-01-15T14:20:00'),
        joinDate: new Date('2023-08-15'),
        invitedBy: 'Maria Garcia',
        notes: 'Certified heavy equipment operator',
        tags: ['operator', 'certified', 'safety-conscious'],
        addedDate: new Date('2023-08-15'),
        lastUpdated: new Date('2024-01-10')
      },
      {
        id: '5',
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.wilson@contractor.com',
        phone: '+1-555-654-3210',
        avatar: undefined,
        role: 'contractor',
        status: 'pending',
        department: 'External',
        position: 'Electrical Contractor',
        permissions: {
          projects: 'read',
          inventory: 'none',
          procurement: 'none',
          reports: 'none',
          users: 'none',
          settings: 'none'
        },
        projects: ['Office Building B'],
        joinDate: new Date('2024-01-10'),
        invitedBy: 'Maria Garcia',
        notes: 'New contractor pending security clearance',
        tags: ['contractor', 'electrical', 'pending-approval'],
        addedDate: new Date('2024-01-10'),
        lastUpdated: new Date('2024-01-12')
      }
    ]

    setUsers(mockUsers)
    setFilteredUsers(mockUsers)
  }, [])

  // Apply filters
  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.department.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.position.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.notes.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesRole = filters.role === 'all' || user.role === filters.role
      const matchesDepartment = filters.department === 'all' || user.department === filters.department
      const matchesStatus = filters.status === 'all' || user.status === filters.status
      
      // Permission level filter
      let matchesPermissions = true
      if (filters.permissions !== 'all') {
        const permissionLevels = Object.values(user.permissions)
        if (filters.permissions === 'admin') {
          matchesPermissions = permissionLevels.includes('admin')
        } else if (filters.permissions === 'write') {
          matchesPermissions = permissionLevels.includes('write') || permissionLevels.includes('admin')
        } else if (filters.permissions === 'read') {
          matchesPermissions = permissionLevels.includes('read') || permissionLevels.includes('write') || permissionLevels.includes('admin')
        }
      }

      return matchesSearch && matchesRole && matchesDepartment && matchesStatus && matchesPermissions
    })

    setFilteredUsers(filtered)
  }, [users, filters])

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingUsers: users.filter(u => u.status === 'pending').length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    recentLogins: users.filter(u => u.lastLogin && 
      (new Date().getTime() - u.lastLogin.getTime()) < 24 * 60 * 60 * 1000).length,
    departments: [...new Set(users.map(u => u.department))].length
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
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingUsers}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.adminUsers}</div>
            <p className="text-xs text-muted-foreground">System administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentLogins}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <UsersFilters
        filters={filters}
        onFiltersChange={setFilters}
        users={users}
      />

      {/* Main Content */}
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
            onUserUpdate={(userId, updates) => {
              setUsers(prev => prev.map(user => 
                user.id === userId ? { ...user, ...updates } : user
              ))
            }}
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                User login and system activity logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers
                  .filter(user => user.lastLogin)
                  .sort((a, b) => (b.lastLogin?.getTime() || 0) - (a.lastLogin?.getTime() || 0))
                  .slice(0, 10)
                  .map((user) => (
                    <div key={user.id} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Logged in • {user.lastLogin ? format(user.lastLogin, 'MMM dd, yyyy HH:mm') : 'Never'}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        <Activity className="h-3 w-3 mr-1" />
                        {user.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
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

      {/* Add User Dialog */}
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onUserAdded={(newUser) => {
          setUsers(prev => [...prev, newUser])
          setIsAddDialogOpen(false)
        }}
      />
    </div>
  )
}