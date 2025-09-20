'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { SignUpButton } from '@clerk/nextjs'
import { UserRole } from '@/hooks/useUserProfile'
import { Users, Shield, Settings, AlertCircle, CheckCircle } from 'lucide-react'

interface RoleRegistrationProps {
  onCancel: () => void
}

const ROLE_INFO = {
  worker: {
    icon: Users,
    label: 'Worker',
    description: 'Access to daily operations, inventory, and assigned projects',
    requiresPassword: false,
    color: 'bg-green-100 text-green-800'
  },
  project_manager: {
    icon: Shield,
    label: 'Project Manager',
    description: 'Manage projects, approve requisitions, and oversee workers',
    requiresPassword: true,
    color: 'bg-blue-100 text-blue-800'
  },
  super_admin: {
    icon: Settings,
    label: 'Super Admin',
    description: 'Full system access and administrative controls',
    requiresPassword: true,
    color: 'bg-red-100 text-red-800'
  }
}

export function RoleRegistration({ onCancel }: RoleRegistrationProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker')
  const [registrationPassword, setRegistrationPassword] = useState('')
  const [error, setError] = useState('')
  const [isValidated, setIsValidated] = useState(false)

  const validateRole = () => {
    const roleInfo = ROLE_INFO[selectedRole]
    
    if (!roleInfo.requiresPassword) {
      // Worker role doesn't require password
      handleValidation()
      return
    }

    // Check password for elevated roles
    const requiredPassword = selectedRole === 'project_manager' 
      ? process.env.NEXT_PUBLIC_MANAGER_REGISTRATION_PASSWORD
      : process.env.NEXT_PUBLIC_ADMIN_REGISTRATION_PASSWORD

    if (!requiredPassword) {
      setError('Registration passwords not configured. Please contact your administrator.')
      return
    }

    if (registrationPassword !== requiredPassword) {
      setError('Invalid registration password. Please contact your administrator for the correct password.')
      return
    }

    handleValidation()
  }

  const handleValidation = () => {
    setError('')
    setIsValidated(true)
    
    // Store the validated role in localStorage for the useUserProfile hook
    localStorage.setItem('pendingUserRole', selectedRole)
    console.log('✅ [RoleRegistration] Role validated and stored:', selectedRole)
  }

  const resetValidation = () => {
    setIsValidated(false)
    setError('')
    setRegistrationPassword('')
    localStorage.removeItem('pendingUserRole')
  }

  if (isValidated) {
    const roleInfo = ROLE_INFO[selectedRole]
    const RoleIcon = roleInfo.icon

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle>Role Validated</CardTitle>
          <CardDescription>
            Ready to create your account with {roleInfo.label} permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed">
            <div className="text-center space-y-2">
              <RoleIcon className="h-8 w-8 mx-auto text-primary" />
              <Badge className={roleInfo.color}>
                {roleInfo.label}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {roleInfo.description}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <SignUpButton mode="modal">
              <Button className="w-full" size="lg">
                Continue to Registration
              </Button>
            </SignUpButton>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={resetValidation}
            >
              Change Role
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Your role will be automatically assigned after completing the registration process.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const roleInfo = ROLE_INFO[selectedRole]
  const RoleIcon = roleInfo.icon

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Select Your Role</CardTitle>
        <CardDescription>
          Choose your role and complete validation to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_INFO).map(([role, info]) => (
                <SelectItem key={role} value={role}>
                  <div className="flex items-center space-x-2">
                    <info.icon className="h-4 w-4" />
                    <span>{info.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role Information */}
        <div className="p-4 rounded-lg border bg-muted/50">
          <div className="flex items-start space-x-3">
            <RoleIcon className="h-5 w-5 mt-0.5 text-primary" />
            <div>
              <h4 className="font-medium">{roleInfo.label}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {roleInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Password Input for Elevated Roles */}
        {roleInfo.requiresPassword && (
          <div className="space-y-2">
            <Label htmlFor="password">Registration Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter registration password"
              value={registrationPassword}
              onChange={(e) => setRegistrationPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Contact your administrator for the registration password required for this role.
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button 
            onClick={validateRole} 
            className="w-full"
            disabled={roleInfo.requiresPassword && !registrationPassword.trim()}
          >
            {roleInfo.requiresPassword ? 'Validate & Continue' : 'Continue to Registration'}
          </Button>
          
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Development passwords:</strong><br />
            Project Manager: <code>manager123!</code><br />
            Super Admin: <code>admin123!</code>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}