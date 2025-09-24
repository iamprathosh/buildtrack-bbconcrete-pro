'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { UserPlus, X, Plus } from 'lucide-react'
import { UserProfile } from '@/types/database'

interface AddUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onUserAdded: (user: UserProfile) => void
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'super_admin' | 'project_manager' | 'worker'
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
  notes: string
  tags: string[]
}

const ROLE_PERMISSIONS = {
  super_admin: {
    projects: 'admin' as const,
    inventory: 'admin' as const,
    procurement: 'admin' as const,
    reports: 'admin' as const,
    users: 'admin' as const,
    settings: 'admin' as const,
  },
  project_manager: {
    projects: 'admin' as const,
    inventory: 'write' as const,
    procurement: 'write' as const,
    reports: 'write' as const,
    users: 'read' as const,
    settings: 'none' as const,
  },
  worker: {
    projects: 'read' as const,
    inventory: 'read' as const,
    procurement: 'none' as const,
    reports: 'none' as const,
    users: 'none' as const,
    settings: 'none' as const,
  },
}

const DEPARTMENTS = [
  'Management',
  'Construction',
  'Operations',
  'Engineering',
  'Finance',
  'HR',
  'Safety',
  'Quality Control',
  'External'
]

const PROJECT_OPTIONS = [
  'Residential Complex A',
  'Bridge Construction',
  'Office Building B',
  'Highway Expansion',
  'Shopping Center'
]

export function AddUserDialog({ isOpen, onClose, onUserAdded }: AddUserDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'worker',
    department: '',
    position: '',
    permissions: ROLE_PERMISSIONS.worker,
    projects: [],
    notes: '',
    tags: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')

  const handleRoleChange = (role: FormData['role']) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: ROLE_PERMISSIONS[role]
    }))
  }

  const handlePermissionChange = (module: keyof FormData['permissions'], level: FormData['permissions'][keyof FormData['permissions']]) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: level
      }
    }))
  }

  const handleProjectToggle = (project: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.includes(project)
        ? prev.projects.filter(p => p !== project)
        : [...prev.projects, project]
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: any = {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        role: formData.role,
        is_active: true,
      }
      if (formData.phone) payload.phone = formData.phone
      if (formData.position) payload.position = formData.position
      if (formData.permissions) payload.permissions = formData.permissions

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      onUserAdded(data.user as UserProfile)
      handleReset()
    } catch (err) {
      console.error('Error creating user:', err)
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'worker',
      department: '',
      position: '',
      permissions: ROLE_PERMISSIONS.worker,
      projects: [],
      notes: '',
      tags: []
    })
    setError(null)
    setNewTag('')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const isFormValid = Boolean(
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim()
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Invite New User</span>
          </DialogTitle>
          <DialogDescription>
            Create a new user account and send an invitation email
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>
                Personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role and Department */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role & Department</CardTitle>
              <CardDescription>
                Organizational role and department assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="project_manager">Project Manager</SelectItem>
                      <SelectItem value="worker">Worker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department (optional)</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Job title"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Permissions</CardTitle>
              <CardDescription>
                System access permissions (automatically set based on role, but can be customized)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(formData.permissions).map(([module, level]) => (
                  <div key={module} className="space-y-2">
                    <Label className="capitalize">{module}</Label>
                    <Select
                      value={level}
                      onValueChange={(value: 'read' | 'write' | 'admin' | 'none') => 
                        handlePermissionChange(module as keyof FormData['permissions'], value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="write">Write</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Assignment</CardTitle>
              <CardDescription>
                Select projects this user will have access to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PROJECT_OPTIONS.map(project => (
                  <div key={project} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`project-${project}`}
                      checked={formData.projects.includes(project)}
                      onChange={() => handleProjectToggle(project)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`project-${project}`} className="cursor-pointer">
                      {project}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <CardDescription>
                Notes and tags for better organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this user"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-red-600 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
