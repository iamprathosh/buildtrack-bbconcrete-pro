'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDatabase } from '@/lib/database'
import { format } from 'date-fns'
import { UserProfile } from '@/types/database'
import { Plus, Shield } from 'lucide-react'
import { InviteUserDialog } from './InviteUserDialog'

export function UsersView() {
  const { db, isReady } = useDatabase()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  useEffect(() => {
    if (!isReady) return

    const loadUsers = async () => {
      try {
        setLoading(true)
        const { data, error } = await db
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setUsers(data || [])
      } catch (err) {
        console.error('Error loading users:', err)
        setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [db, isReady])

  const getRoleColor = (role: UserProfile['role']) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800'
      case 'project_manager':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium text-muted-foreground">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-red-600">
            <p className="font-medium">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}

                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <InviteUserDialog
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onUserAdded={(user) => {
          setUsers(prev => [user, ...prev])
        }}
      />
    </div>
  )
}
