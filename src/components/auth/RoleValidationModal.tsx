import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Settings, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { 
  UserRole, 
  ROLE_LABELS, 
  ROLE_DESCRIPTIONS, 
  requiresRegistrationPassword, 
  validateRegistrationPassword 
} from '@/config/registrationPasswords';

interface RoleValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidated: (role: UserRole) => void;
}

const ROLE_ICONS = {
  worker: User,
  project_manager: Shield,
  super_admin: Settings
};

export function RoleValidationModal({ isOpen, onClose, onValidated }: RoleValidationModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');
  const [registrationPassword, setRegistrationPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = () => {
    setError(null);
    
    // Validate registration password if required
    if (requiresRegistrationPassword(selectedRole)) {
      if (!registrationPassword) {
        setError('Registration password is required for this role');
        return;
      }
      if (!validateRegistrationPassword(selectedRole, registrationPassword)) {
        setError('Invalid registration password for this role');
        return;
      }
    }
    
    // Store the validated role in localStorage temporarily
    localStorage.setItem('pendingUserRole', selectedRole);
    
    onValidated(selectedRole);
    onClose();
  };

  const handleClose = () => {
    setSelectedRole('worker');
    setRegistrationPassword('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Role</DialogTitle>
          <DialogDescription>
            Select your role before creating your account
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => {
                  const Icon = ROLE_ICONS[role];
                  const needsPassword = requiresRegistrationPassword(role);
                  
                  return (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{ROLE_LABELS[role]}</span>
                        {needsPassword && <Badge variant="secondary" className="text-xs">Password Required</Badge>}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {ROLE_DESCRIPTIONS[selectedRole]}
            </p>
          </div>

          {requiresRegistrationPassword(selectedRole) && (
            <div className="space-y-2">
              <Label htmlFor="regPassword">Registration Password</Label>
              <div className="relative">
                <Input
                  id="regPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter registration password"
                  value={registrationPassword}
                  onChange={(e) => setRegistrationPassword(e.target.value)}
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
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleValidate} className="flex-1">
              Continue to Registration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
