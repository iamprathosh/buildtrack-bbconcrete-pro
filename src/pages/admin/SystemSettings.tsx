import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building, Mail, Shield, Database, Bell, Palette, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SystemSettings = () => {
  const [companyName, setCompanyName] = useState("B&B Concrete");
  const [companyAddress, setCompanyAddress] = useState("123 Construction Ave, Builder City, BC 12345");
  const [companyPhone, setCompanyPhone] = useState("+1 (555) 123-4567");
  const [companyEmail, setCompanyEmail] = useState("info@bbconcrete.com");
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [dataRetention, setDataRetention] = useState("2-years");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  const [defaultTimeZone, setDefaultTimeZone] = useState("America/New_York");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  
  const { toast } = useToast();

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  return (
    <AppLayout title="System Settings" subtitle="Configure application-wide settings and preferences">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="gradient-card border-0 shadow-brand">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-montserrat">
                <Building className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
              <CardDescription className="font-inter">
                Configure your company details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="font-inter font-medium">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="font-inter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone" className="font-inter font-medium">Phone Number</Label>
                  <Input
                    id="companyPhone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="font-inter"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyEmail" className="font-inter font-medium">Email Address</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="font-inter"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress" className="font-inter font-medium">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="font-inter"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="font-inter font-medium">Default Time Zone</Label>
                  <Select value={defaultTimeZone} onValueChange={setDefaultTimeZone}>
                    <SelectTrigger className="font-inter">
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
                
                <div className="space-y-2">
                  <Label htmlFor="currency" className="font-inter font-medium">Default Currency</Label>
                  <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                    <SelectTrigger className="font-inter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat" className="font-inter font-medium">Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger className="font-inter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings("Company")} variant="primary">
                Save Company Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="gradient-card border-0 shadow-brand">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-montserrat">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="font-inter">
                Configure system-wide notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-inter font-medium">Email Notifications</Label>
                    <p className="text-sm font-inter text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-inter font-medium">SMS Notifications</Label>
                    <p className="text-sm font-inter text-muted-foreground">
                      Send critical alerts via SMS
                    </p>
                  </div>
                  <Switch
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-inter font-medium">Low Stock Alerts</Label>
                    <p className="text-sm font-inter text-muted-foreground">
                      Notify when inventory levels are low
                    </p>
                  </div>
                  <Switch
                    checked={lowStockAlerts}
                    onCheckedChange={setLowStockAlerts}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-inter font-medium">Project Updates</Label>
                    <p className="text-sm font-inter text-muted-foreground">
                      Notify on project status changes
                    </p>
                  </div>
                  <Switch
                    checked={projectUpdates}
                    onCheckedChange={setProjectUpdates}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings("Notification")} variant="primary">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="gradient-card border-0 shadow-brand">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-montserrat">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription className="font-inter">
                Configure system security and access policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-inter font-medium">Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue="60" className="font-inter" />
                </div>
                <div className="space-y-2">
                  <Label className="font-inter font-medium">Password Complexity</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="font-inter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-inter font-medium">Require Two-Factor Authentication</Label>
                    <p className="text-sm font-inter text-muted-foreground">
                      Enforce 2FA for all user accounts
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-inter font-medium">Enable Login Audit Trail</Label>
                    <p className="text-sm font-inter text-muted-foreground">
                      Track all login attempts and activities
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings("Security")} variant="primary">
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="gradient-card border-0 shadow-brand">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-montserrat">
                <Database className="h-5 w-5 text-primary" />
                Data Management
              </CardTitle>
              <CardDescription className="font-inter">
                Configure backup, retention, and maintenance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFreq" className="font-inter font-medium">Backup Frequency</Label>
                  <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                    <SelectTrigger className="font-inter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retention" className="font-inter font-medium">Data Retention Period</Label>
                  <Select value={dataRetention} onValueChange={setDataRetention}>
                    <SelectTrigger className="font-inter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-year">1 Year</SelectItem>
                      <SelectItem value="2-years">2 Years</SelectItem>
                      <SelectItem value="5-years">5 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-inter font-medium">Maintenance Mode</Label>
                  <p className="text-sm font-inter text-muted-foreground">
                    Temporarily disable access for system maintenance
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
              
              <Button onClick={() => handleSaveSettings("Data")} variant="primary">
                Save Data Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="gradient-card border-0 shadow-brand">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-montserrat">
                <Palette className="h-5 w-5 text-primary" />
                Appearance & Branding
              </CardTitle>
              <CardDescription className="font-inter">
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-inter font-medium">Application Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                    <Building className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline">Upload New Logo</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-inter font-medium">Primary Brand Color</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-lg"></div>
                  <Input value="#153275" className="w-32 font-mono" />
                  <Button variant="outline">Change Color</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-inter font-medium">Theme</Label>
                <Select defaultValue="system">
                  <SelectTrigger className="font-inter max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={() => handleSaveSettings("Appearance")} variant="primary">
                Save Appearance Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default SystemSettings;