import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Key, Shield, Settings, Copy, Check } from 'lucide-react';
import { REGISTRATION_PASSWORDS, UserRole, ROLE_LABELS } from '@/config/registrationPasswords';
import { useUserProfile } from '@/hooks/useUserProfile';

export function RegistrationPasswordManager() {
  const { isSuperAdmin } = useUserProfile();
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);

  if (!isSuperAdmin()) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Only Super Admins can access registration password management.
        </AlertDescription>
      </Alert>
    );
  }

  const togglePasswordVisibility = (role: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const copyPassword = async (role: keyof typeof REGISTRATION_PASSWORDS) => {
    try {
      await navigator.clipboard.writeText(REGISTRATION_PASSWORDS[role]);
      setCopiedPassword(role);
      setTimeout(() => setCopiedPassword(null), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const roleData = [
    {
      role: 'project_manager' as const,
      icon: Shield,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    },
    {
      role: 'super_admin' as const, 
      icon: Settings,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Registration Password Management</h2>
        <p className="text-muted-foreground">
          Manage passwords required for elevated role registration
        </p>
      </div>

      <div className="grid gap-4">
        {roleData.map(({ role, icon: Icon, color }) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {ROLE_LABELS[role]}
                <Badge className={color}>
                  Password Required
                </Badge>
              </CardTitle>
              <CardDescription>
                Users must enter this password to register as a {ROLE_LABELS[role].toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Registration Password</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPasswords[role] ? 'text' : 'password'}
                      value={REGISTRATION_PASSWORDS[role]}
                      readOnly
                      className="pr-20"
                    />
                    <div className="absolute right-0 top-0 h-full flex">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-full px-3"
                        onClick={() => togglePasswordVisibility(role)}
                      >
                        {showPasswords[role] ? 
                          <EyeOff className="h-4 w-4" /> : 
                          <Eye className="h-4 w-4" />
                        }
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-full px-3"
                        onClick={() => copyPassword(role)}
                      >
                        {copiedPassword === role ? 
                          <Check className="h-4 w-4 text-green-600" /> : 
                          <Copy className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> These passwords are currently stored as environment 
                  variables. To change them, update your <code>.env</code> file and restart the application.
                  <br />
                  <br />
                  <strong>Environment Variables:</strong>
                  <br />
                  • <code>VITE_MANAGER_REGISTRATION_PASSWORD</code> for Project Manager registration
                  <br />
                  • <code>VITE_ADMIN_REGISTRATION_PASSWORD</code> for Super Admin registration
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>How it works:</strong>
          <br />
          • Workers can register freely without any special password
          <br />
          • Project Managers and Super Admins must enter the correct registration password during signup
          <br />
          • Share these passwords securely with authorized personnel only
          <br />
          • Consider rotating these passwords periodically for better security
        </AlertDescription>
      </Alert>
    </div>
  );
}
