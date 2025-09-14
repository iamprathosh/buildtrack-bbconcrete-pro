import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/file/FileUpload';
import { Settings, Database, Mail, Shield, Bell, Palette, Building, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdvancedSettings = () => {
  const [settings, setSettings] = useState({
    // Company Settings
    companyName: 'B&B Concrete',
    companyLogo: '',
    companyAddress: '123 Main St, City, State 12345',
    companyPhone: '(555) 123-4567',
    companyEmail: 'info@bbconcrete.com',
    timezone: 'America/New_York',
    currency: 'USD',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    lowStockAlerts: true,
    projectDeadlineAlerts: true,
    equipmentMaintenanceAlerts: true,
    
    // Security Settings
    passwordPolicy: 'strong',
    sessionTimeout: 30,
    twoFactorAuth: false,
    auditLogging: true,
    
    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    maintenanceMode: false,
    
    // Integration Settings
    emailProvider: 'sendgrid',
    smsProvider: 'twilio',
    cloudStorage: 'supabase'
  });

  const handleSave = async (section: string) => {
    try {
      // Here you would save to your backend
      toast({
        title: "Settings saved",
        description: `${section} settings have been updated successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  const handleLogoUpload = (files: any[]) => {
    if (files.length > 0) {
      setSettings(prev => ({ ...prev, companyLogo: files[0].url }));
      toast({
        title: "Logo uploaded",
        description: "Company logo has been updated"
      });
    }
  };

  return (
    <AppLayout title="Advanced Settings" subtitle="Configure system-wide settings and preferences">
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="font-montserrat flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Manage your company profile and basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={settings.companyName}
                        onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="companyPhone">Phone Number</Label>
                      <Input
                        id="companyPhone"
                        value={settings.companyPhone}
                        onChange={(e) => setSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="companyEmail">Email Address</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => setSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Company Logo</Label>
                      <FileUpload
                        bucket="company-assets"
                        path="logos"
                        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] }}
                        maxFiles={1}
                        maxSize={2 * 1024 * 1024} // 2MB
                        onUploadComplete={handleLogoUpload}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={settings.companyAddress}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                
                <Button onClick={() => handleSave('Company')}>
                  Save Company Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="font-montserrat flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Alert Types</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">When inventory falls below minimum levels</p>
                    </div>
                    <Switch
                      checked={settings.lowStockAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, lowStockAlerts: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Project Deadline Alerts</Label>
                      <p className="text-sm text-muted-foreground">Upcoming project deadlines</p>
                    </div>
                    <Switch
                      checked={settings.projectDeadlineAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, projectDeadlineAlerts: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Equipment Maintenance</Label>
                      <p className="text-sm text-muted-foreground">Scheduled maintenance reminders</p>
                    </div>
                    <Switch
                      checked={settings.equipmentMaintenanceAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, equipmentMaintenanceAlerts: checked }))}
                    />
                  </div>
                </div>
                
                <Button onClick={() => handleSave('Notifications')}>
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="font-montserrat flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Configuration
                </CardTitle>
                <CardDescription>
                  Manage security policies and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="passwordPolicy">Password Policy</Label>
                      <Select value={settings.passwordPolicy} onValueChange={(value) => setSettings(prev => ({ ...prev, passwordPolicy: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                          <SelectItem value="strong">Strong (12+ chars, mixed case, numbers)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (16+ chars, special chars)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                      </div>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Audit Logging</Label>
                        <p className="text-sm text-muted-foreground">Log all user actions</p>
                      </div>
                      <Switch
                        checked={settings.auditLogging}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auditLogging: checked }))}
                      />
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => handleSave('Security')}>
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="font-montserrat flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Manage system-level settings and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Auto Backup</Label>
                        <p className="text-sm text-muted-foreground">Automatic data backups</p>
                      </div>
                      <Switch
                        checked={settings.autoBackup}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBackup: checked }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select value={settings.backupFrequency} onValueChange={(value) => setSettings(prev => ({ ...prev, backupFrequency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dataRetention">Data Retention (days)</Label>
                      <Input
                        id="dataRetention"
                        type="number"
                        value={settings.dataRetention}
                        onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Disable user access for maintenance</p>
                      </div>
                      <Switch
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">System Health</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-secondary/20 rounded-lg">
                      <div className="text-2xl font-bold text-success">99.9%</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/20 rounded-lg">
                      <div className="text-2xl font-bold text-primary">15GB</div>
                      <div className="text-sm text-muted-foreground">Storage Used</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/20 rounded-lg">
                      <div className="text-2xl font-bold text-info">127</div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/20 rounded-lg">
                      <div className="text-2xl font-bold text-warning">2.1s</div>
                      <div className="text-sm text-muted-foreground">Avg Response</div>
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => handleSave('System')}>
                  Save System Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="font-montserrat flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Third-Party Integrations
                </CardTitle>
                <CardDescription>
                  Configure external service integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">Email Service Provider</h4>
                        <p className="text-sm text-muted-foreground">Service for sending system emails</p>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <Select value={settings.emailProvider} onValueChange={(value) => setSettings(prev => ({ ...prev, emailProvider: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                        <SelectItem value="resend">Resend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">SMS Service Provider</h4>
                        <p className="text-sm text-muted-foreground">Service for sending SMS alerts</p>
                      </div>
                      <Badge variant="secondary">Not Connected</Badge>
                    </div>
                    <Select value={settings.smsProvider} onValueChange={(value) => setSettings(prev => ({ ...prev, smsProvider: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="aws-sns">AWS SNS</SelectItem>
                        <SelectItem value="messagebird">MessageBird</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">Cloud Storage</h4>
                        <p className="text-sm text-muted-foreground">File storage and management</p>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <Select value={settings.cloudStorage} onValueChange={(value) => setSettings(prev => ({ ...prev, cloudStorage: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supabase">Supabase Storage</SelectItem>
                        <SelectItem value="aws-s3">AWS S3</SelectItem>
                        <SelectItem value="google-cloud">Google Cloud Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button onClick={() => handleSave('Integrations')}>
                  Save Integration Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="font-montserrat flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Appearance & Branding
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Theme Customization</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced theming options are available in the Enterprise plan
                  </p>
                  <Button variant="outline">
                    Upgrade to Enterprise
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdvancedSettings;