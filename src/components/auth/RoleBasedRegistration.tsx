import { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Building2, Eye, EyeOff, AlertCircle, Shield, User, Settings } from 'lucide-react';
import { 
  UserRole, 
  ROLE_LABELS, 
  ROLE_DESCRIPTIONS, 
  requiresRegistrationPassword, 
  validateRegistrationPassword 
} from '@/config/registrationPasswords';

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  registrationPassword: string;
}

const ROLE_ICONS = {
  worker: User,
  project_manager: Shield,
  super_admin: Settings
};

export function RoleBasedRegistration({ onCancel }: { onCancel: () => void }) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'worker',
    registrationPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'role' | 'details' | 'verification'>('role');
  const [verificationCode, setVerificationCode] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role, registrationPassword: '' }));
    setError(null);
  };

  const handleRoleNext = () => {
    // Validate registration password if required
    if (requiresRegistrationPassword(formData.role)) {
      if (!formData.registrationPassword) {
        setError('Registration password is required for this role');
        return;
      }
      if (!validateRegistrationPassword(formData.role, formData.registrationPassword)) {
        setError('Invalid registration password for this role');
        return;
      }
    }
    setStep('details');
    setError(null);
  };

  const handleSignUp = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create the sign up with Clerk
      const result = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        // Store the role in unsafe metadata
        unsafeMetadata: {
          pendingRole: formData.role,
          fullName: `${formData.firstName} ${formData.lastName}`
        }
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verification');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      // Complete the email verification
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === 'complete') {
        // The role is already stored in unsafeMetadata and will be picked up by useUserProfile
        // to create the user profile with the correct role
        await setActive({ session: completeSignUp.createdSessionId });
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err?.errors?.[0]?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Choose Your Role</CardTitle>
          <CardDescription>
            Select your role to get started with BuildTrack
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => {
            const Icon = ROLE_ICONS[role];
            const isSelected = formData.role === role;
            const needsPassword = requiresRegistrationPassword(role);
            
            return (
              <div
                key={role}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleRoleSelect(role)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`h-5 w-5 mt-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{ROLE_LABELS[role]}</h3>
                      {needsPassword && <Badge variant="secondary">Password Required</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {requiresRegistrationPassword(formData.role) && (
            <div className="space-y-2">
              <Label htmlFor="regPassword">Registration Password</Label>
              <div className="relative">
                <Input
                  id="regPassword"
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Enter registration password"
                  value={formData.registrationPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationPassword: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                >
                  {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Contact your administrator for the registration password
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleRoleNext} className="flex-1">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'details') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Account Details</CardTitle>
          <CardDescription>
            Create your {ROLE_LABELS[formData.role]} account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@company.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setStep('role')} 
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={handleSignUp} 
              className="flex-1"
              disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email || !formData.password}
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verification') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the verification code sent to {formData.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setStep('details')} 
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={handleVerification} 
              className="flex-1"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
