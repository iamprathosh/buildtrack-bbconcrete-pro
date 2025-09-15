import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Shield, Settings, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: 'worker' | 'project_manager' | 'super_admin';
  is_active: boolean;
  created_at: string;
};

const ROLE_ICONS = {
  worker: User,
  project_manager: Shield,
  super_admin: Settings
};

const ROLE_COLORS = {
  worker: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  project_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export function UserRoleManager() {
  const { isSuperAdmin } = useUserProfile();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (isSuperAdmin()) {
      loadUsers();
    }
  }, [isSuperAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'worker' | 'project_manager' | 'super_admin') => {
    try {
      setUpdating(userId);
      setError(null);

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));

      console.log(`✅ Updated user ${userId} role to ${newRole}`);
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  if (!isSuperAdmin()) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Only Super Admins can manage user roles.
        </AlertDescription>
      </Alert>
    );
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Role Management</h2>
        <p className="text-muted-foreground">
          Manage user roles and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription>
            View and modify user roles. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={loadUsers} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {loading ? (
              <p>Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p>No users found.</p>
            ) : (
              filteredUsers.map((user) => {
                const Icon = ROLE_ICONS[user.role];
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{user.full_name}</span>
                        <Badge className={ROLE_COLORS[user.role]}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {!user.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {user.id} • Created: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={user.role}
                        onValueChange={(newRole: 'worker' | 'project_manager' | 'super_admin') => 
                          updateUserRole(user.id, newRole)
                        }
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="worker">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>Worker</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="project_manager">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4" />
                              <span>Project Manager</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="super_admin">
                            <div className="flex items-center space-x-2">
                              <Settings className="h-4 w-4" />
                              <span>Super Admin</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {updating === user.id && (
                        <div className="text-sm text-muted-foreground">Updating...</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Role changes take effect immediately. Users may need to refresh 
          their browser or sign out and back in to see the updated permissions in the UI.
        </AlertDescription>
      </Alert>
    </div>
  );
}
