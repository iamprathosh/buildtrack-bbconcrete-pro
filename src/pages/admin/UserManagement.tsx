import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search, Plus, Filter, Edit, Trash2, UserCheck, UserX, Shield, Mail, Calendar } from "lucide-react";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@bbconcrete.com",
      role: "Project Manager",
      status: "active",
      lastLogin: "2024-01-16",
      joinDate: "2023-06-15",
      projectsAssigned: 3,
      avatar: null,
      phone: "+1 (555) 123-4567"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@bbconcrete.com",
      role: "Site Supervisor",
      status: "active",
      lastLogin: "2024-01-15",
      joinDate: "2023-08-20",
      projectsAssigned: 2,
      avatar: null,
      phone: "+1 (555) 234-5678"
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@bbconcrete.com",
      role: "Admin",
      status: "active",
      lastLogin: "2024-01-16",
      joinDate: "2023-01-10",
      projectsAssigned: 0,
      avatar: null,
      phone: "+1 (555) 345-6789"
    },
    {
      id: 4,
      name: "Lisa Chen",
      email: "lisa.chen@bbconcrete.com",
      role: "Worker",
      status: "active",
      lastLogin: "2024-01-14",
      joinDate: "2023-09-05",
      projectsAssigned: 1,
      avatar: null,
      phone: "+1 (555) 456-7890"
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@bbconcrete.com",
      role: "Project Manager",
      status: "inactive",
      lastLogin: "2024-01-08",
      joinDate: "2023-03-15",
      projectsAssigned: 1,
      avatar: null,
      phone: "+1 (555) 567-8901"
    },
    {
      id: 6,
      name: "Emma Davis",
      email: "emma.davis@bbconcrete.com",
      role: "Worker",
      status: "active",
      lastLogin: "2024-01-16",
      joinDate: "2023-11-01",
      projectsAssigned: 2,
      avatar: null,
      phone: "+1 (555) 678-9012"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { variant: "success", label: "Active", icon: UserCheck };
      case "inactive":
        return { variant: "destructive", label: "Inactive", icon: UserX };
      case "pending":
        return { variant: "warning", label: "Pending", icon: Users };
      default:
        return { variant: "secondary", label: status, icon: Users };
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return { variant: "destructive", label: "Admin", icon: Shield };
      case "Project Manager":
        return { variant: "info", label: "Project Manager", icon: Users };
      case "Site Supervisor":
        return { variant: "warning", label: "Site Supervisor", icon: Users };
      case "Worker":
        return { variant: "outline", label: "Worker", icon: Users };
      default:
        return { variant: "secondary", label: role, icon: Users };
    }
  };

  const roles = ["all", "Admin", "Project Manager", "Site Supervisor", "Worker"];
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const inactiveUsers = users.filter(u => u.status === "inactive").length;
  const adminUsers = users.filter(u => u.role === "Admin").length;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <AppLayout title="User Management" subtitle="Manage system users and permissions">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-montserrat font-bold text-foreground">
                    {totalUsers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-montserrat font-bold text-success">
                    {activeUsers}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Inactive Users</p>
                  <p className="text-2xl font-montserrat font-bold text-destructive">
                    {inactiveUsers}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Administrators</p>
                  <p className="text-2xl font-montserrat font-bold text-warning">
                    {adminUsers}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-warning" />
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
                  {role}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
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
                {filteredUsers.map((user) => {
                  const statusBadge = getStatusBadge(user.status);
                  const roleBadge = getRoleBadge(user.role);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-secondary/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || ""} />
                            <AvatarFallback className="text-xs font-inter">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-inter font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground font-inter">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={roleBadge.variant as any}
                          className="flex items-center gap-1 w-fit"
                        >
                          <Shield className="h-3 w-3" />
                          {roleBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusBadge.variant as any}
                          className="flex items-center gap-1 w-fit"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-inter">
                        {user.projectsAssigned}
                      </TableCell>
                      <TableCell className="font-inter">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-inter">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="gradient-card border-0 shadow-brand">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-montserrat">
              <Calendar className="h-5 w-5 text-primary" />
              Recent User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <div className="flex-1">
                  <p className="text-sm font-inter font-medium">Emma Davis logged in</p>
                  <p className="text-xs text-muted-foreground font-inter">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-2 h-2 rounded-full bg-info"></div>
                <div className="flex-1">
                  <p className="text-sm font-inter font-medium">Mike Wilson updated user permissions</p>
                  <p className="text-xs text-muted-foreground font-inter">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-2 h-2 rounded-full bg-warning"></div>
                <div className="flex-1">
                  <p className="text-sm font-inter font-medium">David Brown account marked as inactive</p>
                  <p className="text-xs text-muted-foreground font-inter">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default UserManagement;