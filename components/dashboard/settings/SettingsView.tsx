'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Users, 
  FileText,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface SettingsViewProps {
  user?: any
}

interface CompanySettings {
  name: string
  address: string
  phone: string
  email: string
  website: string
  taxId: string
  timezone: string
  currency: string
  fiscalYearStart: string
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  loginNotifications: boolean
  sessionTimeout: number
  passwordRequirements: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
  }
}

interface NotificationSettings {
  emailNotifications: {
    newProjects: boolean
    invoiceReminders: boolean
    expenseApprovals: boolean
    equipmentMaintenance: boolean
    systemUpdates: boolean
  }
  pushNotifications: {
    newProjects: boolean
    invoiceReminders: boolean
    expenseApprovals: boolean
    equipmentMaintenance: boolean
  }
}

export default function SettingsView({ user }: SettingsViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('account')

  // Mock data - replace with actual data from your backend
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'BB Concrete Pro',
    address: '123 Construction Ave, Building City, BC 12345',
    phone: '(555) 123-4567',
    email: 'contact@bbconcretepro.com',
    website: 'www.bbconcretepro.com',
    taxId: 'TAX123456789',
    timezone: 'America/Vancouver',
    currency: 'CAD',
    fiscalYearStart: 'January'
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    }
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: {
      newProjects: true,
      invoiceReminders: true,
      expenseApprovals: true,
      equipmentMaintenance: true,
      systemUpdates: true
    },
    pushNotifications: {
      newProjects: true,
      invoiceReminders: true,
      expenseApprovals: true,
      equipmentMaintenance: false
    }
  })

  const handleSaveCompanySettings = async () => {
    setIsLoading(true)
    try {
      // Add your API call here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Company settings saved successfully')
    } catch (error) {
      toast.error('Failed to save company settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSecuritySettings = async () => {
    setIsLoading(true)
    try {
      // Add your API call here
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Security settings saved successfully')
    } catch (error) {
      toast.error('Failed to save security settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotificationSettings = async () => {
    setIsLoading(true)
    try {
      // Add your API call here
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Notification settings saved successfully')
    } catch (error) {
      toast.error('Failed to save notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    setIsLoading(true)
    try {
      // Add your data export logic here
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Data export started. You will receive an email when complete.')
    } catch (error) {
      toast.error('Failed to start data export')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackupDatabase = async () => {
    setIsLoading(true)
    try {
      // Add your backup logic here
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Database backup created successfully')
    } catch (error) {
      toast.error('Failed to create database backup')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your system preferences and configuration</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details and business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID</Label>
                  <Input
                    id="tax-id"
                    value={companySettings.taxId}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, taxId: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={companySettings.timezone} 
                    onValueChange={(value) => setCompanySettings(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Vancouver">Pacific Time (Vancouver)</SelectItem>
                      <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (Chicago)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (Denver)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (New York)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={companySettings.currency} 
                    onValueChange={(value) => setCompanySettings(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal-year">Fiscal Year Start</Label>
                  <Select 
                    value={companySettings.fiscalYearStart} 
                    onValueChange={(value) => setCompanySettings(prev => ({ ...prev, fiscalYearStart: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="July">July</SelectItem>
                      <SelectItem value="October">October</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveCompanySettings} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication & Security</CardTitle>
              <CardDescription>
                Configure security settings and authentication requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone logs into your account
                  </p>
                </div>
                <Switch
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, loginNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min="5"
                  max="480"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings(prev => ({ 
                    ...prev, 
                    sessionTimeout: parseInt(e.target.value) 
                  }))}
                />
                <p className="text-sm text-muted-foreground">
                  Automatically log out users after this period of inactivity
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Password Requirements</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Minimum length: {securitySettings.passwordRequirements.minLength} characters</span>
                    <Input
                      type="number"
                      min="6"
                      max="32"
                      value={securitySettings.passwordRequirements.minLength}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordRequirements: {
                          ...prev.passwordRequirements,
                          minLength: parseInt(e.target.value)
                        }
                      }))}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require uppercase letters</span>
                    <Switch
                      checked={securitySettings.passwordRequirements.requireUppercase}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordRequirements: {
                          ...prev.passwordRequirements,
                          requireUppercase: checked
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require lowercase letters</span>
                    <Switch
                      checked={securitySettings.passwordRequirements.requireLowercase}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordRequirements: {
                          ...prev.passwordRequirements,
                          requireLowercase: checked
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require numbers</span>
                    <Switch
                      checked={securitySettings.passwordRequirements.requireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordRequirements: {
                          ...prev.passwordRequirements,
                          requireNumbers: checked
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require special characters</span>
                    <Switch
                      checked={securitySettings.passwordRequirements.requireSpecialChars}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordRequirements: {
                          ...prev.passwordRequirements,
                          requireSpecialChars: checked
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSecuritySettings} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Security Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose which email notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Projects</Label>
                  <p className="text-sm text-muted-foreground">When new projects are created</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications.newProjects}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({
                    ...prev,
                    emailNotifications: { ...prev.emailNotifications, newProjects: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Invoice Reminders</Label>
                  <p className="text-sm text-muted-foreground">Payment due dates and overdue invoices</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications.invoiceReminders}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({
                    ...prev,
                    emailNotifications: { ...prev.emailNotifications, invoiceReminders: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Expense Approvals</Label>
                  <p className="text-sm text-muted-foreground">When expenses need approval</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications.expenseApprovals}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({
                    ...prev,
                    emailNotifications: { ...prev.emailNotifications, expenseApprovals: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Equipment Maintenance</Label>
                  <p className="text-sm text-muted-foreground">Scheduled maintenance reminders</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications.equipmentMaintenance}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({
                    ...prev,
                    emailNotifications: { ...prev.emailNotifications, equipmentMaintenance: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">Important system announcements</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications.systemUpdates}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({
                    ...prev,
                    emailNotifications: { ...prev.emailNotifications, systemUpdates: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Configure in-app and browser push notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Projects</Label>
                  <p className="text-sm text-muted-foreground">Instant notifications for new projects</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications.newProjects}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({
                    ...prev,
                    pushNotifications: { ...prev.pushNotifications, newProjects: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Invoice Reminders</Label>
                  <p className="text-sm text-muted-foreground">Urgent payment notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications.invoiceReminders}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({
                    ...prev,
                    pushNotifications: { ...prev.pushNotifications, invoiceReminders: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Expense Approvals</Label>
                  <p className="text-sm text-muted-foreground">Approval requests notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications.expenseApprovals}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({
                    ...prev,
                    pushNotifications: { ...prev.pushNotifications, expenseApprovals: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Equipment Maintenance</Label>
                  <p className="text-sm text-muted-foreground">Maintenance due notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications.equipmentMaintenance}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({
                    ...prev,
                    pushNotifications: { ...prev.pushNotifications, equipmentMaintenance: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotificationSettings} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export data and manage system backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your data in CSV format for external analysis or backup purposes.
                  </p>
                  <Button
                    onClick={handleExportData}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isLoading ? 'Exporting...' : 'Export Data'}
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Database Backup</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a complete backup of your database for disaster recovery.
                  </p>
                  <Button
                    onClick={handleBackupDatabase}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {isLoading ? 'Creating Backup...' : 'Backup Database'}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Version</Label>
                    <p className="text-muted-foreground">BuildTrack v2.1.0</p>
                  </div>
                  <div>
                    <Label>Last Backup</Label>
                    <p className="text-muted-foreground">2024-01-15 10:30 PM</p>
                  </div>
                  <div>
                    <Label>Database Size</Label>
                    <p className="text-muted-foreground">245 MB</p>
                  </div>
                  <div>
                    <Label>Active Users</Label>
                    <p className="text-muted-foreground">12 users</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                These actions are irreversible. Please proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-destructive">Reset All Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Reset all system settings to their default values. This will not delete your data.
                </p>
                <Button variant="destructive" size="sm">
                  Reset Settings
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-destructive">Delete All Data</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all data from your account. This action cannot be undone.
                </p>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}