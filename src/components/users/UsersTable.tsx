'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { format } from 'date-fns'
import { 
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Shield,
  Crown,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowUpDown
} from 'lucide-react'
import { User } from './UsersView'

interface UsersTableProps {
  users: User[]
  selectedUsers: string[]
  onSelectedUsersChange: (selected: string[]) => void
  onUserUpdate: (userId: string, updates: Partial<User>) => void
}

type SortField = 'name' | 'email' | 'role' | 'department' | 'status' | 'lastLogin' | 'joinDate'
type SortOrder = 'asc' | 'desc'

export function UsersTable({ users, selectedUsers, onSelectedUsersChange, onUserUpdate }: UsersTableProps) {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedUsers = [...users].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'name':
        aValue = `${a.firstName} ${a.lastName}`
        bValue = `${b.firstName} ${b.lastName}`
        break
      case 'email':
        aValue = a.email
        bValue = b.email
        break
      case 'role':
        aValue = a.role
        bValue = b.role
        break
      case 'department':
        aValue = a.department
        bValue = b.department
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'lastLogin':
        aValue = a.lastLogin ? a.lastLogin.getTime() : 0
        bValue = b.lastLogin ? b.lastLogin.getTime() : 0
        break
      case 'joinDate':
        aValue = a.joinDate.getTime()
        bValue = b.joinDate.getTime()
        break
      default:
        aValue = a.firstName
        bValue = b.firstName
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedUsersChange(users.map(u => u.id))
    } else {
      onSelectedUsersChange([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectedUsersChange([...selectedUsers, userId])
    } else {
      onSelectedUsersChange(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    setIsUpdating(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_status',
          status: newStatus,
          oldStatus: users.find(u => u.id === userId)?.status
        })
      })

      if (response.ok) {
        onUserUpdate(userId, { status: newStatus })
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    setIsUpdating(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onUserUpdate(userId, { status: 'inactive' })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleResendInvite = async (userId: string) => {
    setIsUpdating(userId)
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'resend_invitation'
        })
      })
    } catch (error) {
      console.error('Error resending invite:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-purple-600" />
      case 'manager':
        return <Shield className="h-4 w-4 text-blue-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 data-[state=open]:bg-accent font-medium"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field ? (
        sortOrder === 'asc' ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  )

  const allSelected = users.length > 0 && selectedUsers.length === users.length
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Directory</CardTitle>
        <CardDescription>
          Manage team members and their access permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all users"
                    {...(someSelected ? { 'data-state': 'indeterminate' } : {})}
                  />
                </TableHead>
                <TableHead>
                  <SortButton field="name">User</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="role">Role</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="department">Department</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="status">Status</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="lastLogin">Last Login</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="joinDate">Join Date</SortButton>
                </TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      aria-label={`Select ${user.firstName} ${user.lastName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="text-sm text-muted-foreground flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.department}</div>
                      <div className="text-sm text-muted-foreground">{user.position}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.status}
                      onValueChange={(value: User['status']) => handleStatusChange(user.id, value)}
                      disabled={isUpdating === user.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          <Badge variant="secondary" className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.lastLogin ? (
                        <>
                          <div>{format(user.lastLogin, 'MMM dd, yyyy')}</div>
                          <div className="text-muted-foreground">
                            {format(user.lastLogin, 'HH:mm')}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(user.joinDate, 'MMM dd, yyyy')}</div>
                      <div className="text-muted-foreground">
                        {user.invitedBy && `by ${user.invitedBy}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        {user.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResendInvite(user.id)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Resend Invite
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {users.length === 0 && (
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">No users found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or add new users
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
