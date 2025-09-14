import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Key, Smartphone, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@bbconcrete.com",
    phone: "+1 (555) 123-4567"
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const { toast } = useToast();

  const handlePersonalInfoSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your personal information has been saved successfully.",
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
  };

  return (
    <AppLayout title="My Profile" subtitle="Manage your account settings and security preferences">
      <div className="max-w-4xl mx-auto space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="2fa" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Two-Factor Auth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-montserrat">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription className="font-inter">
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-inter font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      className="font-inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-inter font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      className="font-inter"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-inter font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="font-inter"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-inter font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="font-inter"
                  />
                </div>
                
                <Button onClick={handlePersonalInfoSave} variant="primary">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-montserrat">
                  <Key className="h-5 w-5 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription className="font-inter">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="font-inter font-medium">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    className="font-inter"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="font-inter font-medium">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    className="font-inter"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="font-inter font-medium">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className="font-inter"
                  />
                </div>
                
                <Button onClick={handlePasswordChange} variant="primary">
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="2fa" className="space-y-6">
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-montserrat">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Two-Factor Authentication
                  {twoFactorEnabled && (
                    <Badge variant="outline" className="bg-success/10 border-success text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="font-inter">
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!twoFactorEnabled ? (
                  <>
                    <Alert className="border-info/20 bg-info/10">
                      <Smartphone className="h-4 w-4 text-info" />
                      <AlertDescription className="font-inter text-info">
                        Two-factor authentication is currently disabled. Enable it to secure your account with an additional verification step.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={() => setTwoFactorEnabled(true)} 
                      variant="primary"
                    >
                      Enable Two-Factor Authentication
                    </Button>
                  </>
                ) : (
                  <>
                    <Alert className="border-success/20 bg-success/10">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <AlertDescription className="font-inter text-success">
                        Two-factor authentication is active. Your account is protected with an additional security layer.
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-3">
                      <Button variant="outline">
                        View Recovery Codes
                      </Button>
                      <Button 
                        onClick={() => setTwoFactorEnabled(false)} 
                        variant="destructive"
                      >
                        Disable 2FA
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;