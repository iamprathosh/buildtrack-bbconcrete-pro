'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Edit,
  Trash2,
  Calendar,
  Clock,
  MoreVertical,
} from 'lucide-react'
import { UserWithRelations } from './UsersView'
import { ProjectAssignment, ProjectAssignmentRole, ProjectAssignmentStatus } from '@/types/database'
import { useDatabase } from '@/lib/database'

interface ProjectAssignmentsTableProps {
  user: UserWithRelations
  onAssignmentUpdate: () => void
}

export function ProjectAssignmentsTable({ user, onAssignmentUpdate }: ProjectAssignmentsTableProps) {
  const { db } = useDatabase()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (assignmentId: string, newStatus: ProjectAssignmentStatus) => {
    setIsUpdating(true)
    try {
      const { error } = await db
        .from('project_assignments')
        .update({ status: newStatus })
        .eq('id', assignmentId)

      if (error) throw error
      onAssignmentUpdate()
    } catch (err) {
      console.error('Failed to update assignment status:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return

    setIsUpdating(true)
    try {
      const { error } = await db
        .from('project_assignments')
        .delete()
        .eq('id', assignmentId)

      if (error) throw error
      onAssignmentUpdate()
    } catch (err) {
      console.error('Failed to delete assignment:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const getRoleVariant = (role: ProjectAssignmentRole) => {
    switch (role) {
      case 'project_manager':
        return 'default'
      case 'supervisor':
        return 'secondary'
      case 'consultant':
        return 'outline'
      default:
        return 'ghost'
    }
  }

  const getStatusVariant = (status: ProjectAssignmentStatus) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'pending':
        return 'warning'
      case 'completed':
        return 'secondary'
      case 'removed':
        return 'destructive'
      default:
        return 'ghost'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Assignments</CardTitle>
        <CardDescription>
          Current and past project assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.project_assignments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No project assignments
                  </TableCell>
                </TableRow>
              ) : (
                user.project_assignments?.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="font-medium">{assignment.project_id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleVariant(assignment.role)} className="capitalize">
                        {assignment.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={assignment.status}
                        onValueChange={(value: ProjectAssignmentStatus) => handleStatusChange(assignment.id, value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="removed">Removed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {assignment.start_date ? (
                          format(new Date(assignment.start_date), 'MMM dd, yyyy')
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {assignment.end_date ? (
                          format(new Date(assignment.end_date), 'MMM dd, yyyy')
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {assignment.hours_allocated || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Assignment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(assignment.id, 'completed')}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(assignment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Assignment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}