import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Users, Search, Plus, Filter, Edit, Trash2, UserCheck, UserX, Shield, Mail, Calendar, Phone, MoreHorizontal, Settings, Key, Ban, CheckCircle, AlertTriangle, Briefcase, Wrench } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { RoleGuard, AdminOnlyGuard } from '@/components/auth/RoleGuard';
import { UserActivityDisplay } from '@/components/users/UserActivityDisplay';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

interface UserFormData {
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    phone: '',
    role: 'worker'
  });

  const queryClient = useQueryClient();

  // Fetch users from database
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch project assignments count
  const {
    data: projectAssignments = {},
    isLoading: isLoadingAssignments
  } = useQuery({
    queryKey: ['user_project_assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_assignments')
        .select('user_id')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Count assignments per user
      const counts: Record<string, number> = {};
      data?.forEach(assignment => {
        counts[assignment.user_id] = (counts[assignment.user_id] || 0) + 1;
      });
      
      return counts;
    },
    enabled: users.length > 0
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          id: `user_${Date.now()}`, // Temporary ID - in real app this would be managed by auth system
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: "Success", description: "User created successfully" });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to create user: ${error.message}`,
        variant: "destructive" 
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserProfile> & { id: string }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: "Success", description: "User updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update user: ${error.message}`,
        variant: "destructive" 
      });
    }
  });

  // Toggle user active status
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ 
        title: "Success", 
        description: `User ${data.is_active ? 'activated' : 'deactivated'} successfully` 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update user status: ${error.message}`,
        variant: "destructive" 
      });
    }
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      role: 'worker'
    });
  };

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      phone: user.phone || '',
      role: user.role || 'worker'
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, ...formData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  // Utility functions
  const getStatusBadge = (is_active: boolean) => {
    return is_active 
      ? { 
          label: "Active", 
          icon: UserCheck, 
          colorClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0" 
        }
      : { 
          label: "Inactive", 
          icon: UserX, 
          colorClass: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-0" 
        };
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return { 
          label: "Super Admin", 
          icon: Shield, 
          colorClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-0" 
        };
      case "project_manager":
        return { 
          label: "Manager", 
          icon: Briefcase, 
          colorClass: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-0" 
        };
      case "worker":
        return { 
          label: "Worker", 
          icon: Wrench, 
          colorClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0" 
        };
      default:
        return { 
          label: role, 
          icon: Users, 
          colorClass: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-0" 
        };
    }
  };

  const roles: (UserRole | "all")[] = ["all", "super_admin", "project_manager", "worker"];
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = users.filter(u => !u.is_active).length;
  const adminUsers = users.filter(u => u.role === "super_admin").length;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleDisplayName = (role: UserRole | "all") => {
    switch (role) {
      case "super_admin": return "Super Admin";
      case "project_manager": return "Project Manager";
      case "worker": return "Worker";
      case "all": return "All";
      default: return role;
    }
  };

  // Loading state
  if (isLoadingUsers) {
    return (
      <AdminOnlyGuard showError>
        <AppLayout title="User Management" subtitle="Manage system users and permissions">
          <div className="space-y-6">
            {/* Loading KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="gradient-card border-0 shadow-brand">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-12" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Loading Table */}
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </AppLayout>
      </AdminOnlyGuard>
    );
  }

  // Error state
  if (usersError) {
    return (
      <AdminOnlyGuard showError>
        <AppLayout title="User Management" subtitle="Manage system users and permissions">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load users: {usersError.message}
            </AlertDescription>
          </Alert>
        </AppLayout>
      </AdminOnlyGuard>
    );
  }

  return (
    <AdminOnlyGuard showError>
      <AppLayout title="User Management" subtitle="Manage system users and permissions">
        <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-card border-0 shadow-brand hover:shadow-brand-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-montserrat font-bold text-foreground">
                    {totalUsers}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand hover:shadow-brand-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-montserrat font-bold text-success">
                    {activeUsers}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-success/10">
                  <UserCheck className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand hover:shadow-brand-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Inactive Users</p>
                  <p className="text-3xl font-montserrat font-bold text-destructive">
                    {inactiveUsers}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-destructive/10">
                  <UserX className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand hover:shadow-brand-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Administrators</p>
                  <p className="text-3xl font-montserrat font-bold text-red-600">
                    {adminUsers}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-inter"
              />
            </div>
            
            <div className="flex gap-2">
              {roles.map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                  className="capitalize"
                >
                  {getRoleDisplayName(role)}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account with role and permissions.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="worker">Worker</SelectItem>
                          <SelectItem value="project_manager">Project Manager</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Users Table */}
        <Card className="gradient-card border-0 shadow-brand">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-montserrat">
              <Users className="h-5 w-5 text-primary" />
              System Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-inter font-semibold">User</TableHead>
                  <TableHead className="font-inter font-semibold">Role</TableHead>
                  <TableHead className="font-inter font-semibold">Status</TableHead>
                  <TableHead className="font-inter font-semibold">Projects</TableHead>
                  <TableHead className="font-inter font-semibold">Last Login</TableHead>
                  <TableHead className="font-inter font-semibold">Join Date</TableHead>
                  <TableHead className="font-inter font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {searchTerm || roleFilter !== "all" ? "No users found matching your criteria" : "No users found"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const statusBadge = getStatusBadge(user.is_active);
                    const roleBadge = getRoleBadge(user.role || 'worker');
                    const StatusIcon = statusBadge.icon;
                    const projectCount = projectAssignments[user.id] || 0;
                    
                    return (
                      <TableRow key={user.id} className="hover:bg-secondary/30 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="text-sm font-inter bg-primary/10 text-primary font-semibold">
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-inter font-medium text-foreground truncate">{user.full_name}</p>
                              <p className="text-sm text-muted-foreground font-inter truncate">{user.email}</p>
                              {user.phone && (
                                <p className="text-xs text-muted-foreground font-inter flex items-center gap-1 mt-1">
                                  <Phone className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{user.phone}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="secondary"
                            className={`flex items-center gap-1 w-fit text-xs ${roleBadge.colorClass}`}
                          >
                            <roleBadge.icon className="h-3 w-3" />
                            {roleBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant="secondary"
                            className={`flex items-center gap-1 w-fit text-xs ${statusBadge.colorClass}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs px-2 py-0.5"
                            >
                              {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-inter py-4">
                          <span className="text-sm text-muted-foreground">
                            {user.updated_at ? formatDistanceToNow(new Date(user.updated_at), { addSuffix: true }) : 'Never'}
                          </span>
                        </TableCell>
                        <TableCell className="font-inter py-4">
                          <span className="text-sm text-muted-foreground">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              title="Edit User"
                              className="h-8 w-8 p-0 hover:bg-secondary"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  title={user.is_active ? "Deactivate User" : "Activate User"}
                                  className={`h-8 w-8 p-0 hover:bg-secondary ${user.is_active ? "text-warning hover:text-warning" : "text-success hover:text-success"}`}
                                >
                                  {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {user.is_active ? 'Deactivate User' : 'Activate User'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to {user.is_active ? 'deactivate' : 'activate'} {user.full_name}? 
                                    {user.is_active && ' This will prevent them from accessing the system.'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => toggleUserStatusMutation.mutate({ 
                                      id: user.id, 
                                      is_active: !user.is_active 
                                    })}
                                    disabled={toggleUserStatusMutation.isPending}
                                  >
                                    {toggleUserStatusMutation.isPending ? 'Processing...' : 'Confirm'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              title="Send Email"
                              onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                              className="h-8 w-8 p-0 hover:bg-secondary text-muted-foreground hover:text-foreground"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Activity Display - Temporarily Disabled */}
        <Card className="gradient-card border-0 shadow-brand">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-montserrat">
              <Calendar className="h-5 w-5 text-primary" />
              User Activity Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              User activity tracking is temporarily disabled while we fix performance issues.
              This feature will be re-enabled soon.
            </p>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_full_name">Full Name</Label>
                    <Input
                      id="edit_full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_phone">Phone (Optional)</Label>
                    <Input
                      id="edit_phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_role">Role</Label>
                    <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worker">Worker</SelectItem>
                        <SelectItem value="project_manager">Project Manager</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Created:</strong> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'Unknown'}</p>
                    <p><strong>Last Updated:</strong> {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleString() : 'Never'}</p>
                    <p><strong>Status:</strong> {selectedUser.is_active ? 'Active' : 'Inactive'}</p>
                    <p><strong>Projects:</strong> {projectAssignments[selectedUser.id] || 0} active assignments</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </AppLayout>
    </AdminOnlyGuard>
  );
};

export default UserManagement;