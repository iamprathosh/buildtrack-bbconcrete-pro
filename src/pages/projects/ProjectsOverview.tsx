import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Search, Plus, Calendar, DollarSign, Users, MapPin, Clock, Loader2 } from "lucide-react";
import { useProjects, useCustomers, useUsers } from "@/hooks/useProjects";
import { toast } from "@/hooks/use-toast";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectListItem } from "@/components/projects/ProjectListItem";
import { ViewToggle } from "@/components/projects/ViewToggle";

const ProjectsOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    job_number: "",
    description: "",
    customer_id: "",
    project_manager_id: "",
    location: "",
    budget: "",
    start_date: "",
    end_date: "",
    status: "planning" as const
  });

  const { 
    projects, 
    isLoading, 
    error, 
    createProject 
  } = useProjects();
  
  const { data: customers } = useCustomers();
  const { data: users } = useUsers();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { variant: "success", label: "Active" };
      case "planning":
        return { variant: "warning", label: "Planning" };
      case "completed":
        return { variant: "outline", label: "Completed" };
      case "on_hold":
        return { variant: "destructive", label: "On Hold" };
      default:
        return { variant: "secondary", label: status };
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.job_number) {
      toast({
        title: "Error",
        description: "Project name and job number are required.",
        variant: "destructive"
      });
      return;
    }

    const projectData = {
      ...newProject,
      budget: newProject.budget ? parseFloat(newProject.budget) : null,
      start_date: newProject.start_date || null,
      end_date: newProject.end_date || null,
    };

    await createProject.mutateAsync(projectData);
    setIsCreateDialogOpen(false);
    setNewProject({
      name: "",
      job_number: "",
      description: "",
      customer_id: "",
      project_manager_id: "",
      location: "",
      budget: "",
      start_date: "",
      end_date: "",
      status: "planning"
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-success";
    if (progress >= 70) return "bg-info";
    if (progress >= 40) return "bg-warning";
    return "bg-primary";
  };

  const statuses = ["all", "active", "planning", "completed", "on_hold"];
  
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.job_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const totalBudget = projects?.reduce((sum, project) => sum + (project.budget || 0), 0) || 0;
  const totalSpent = projects?.reduce((sum, project) => sum + project.spent, 0) || 0;
  const activeProjects = projects?.filter(p => p.status === "active").length || 0;
  const completedProjects = projects?.filter(p => p.status === "completed").length || 0;

  if (isLoading) {
    return (
      <AppLayout title="Projects Overview" subtitle="Manage all construction projects and their progress">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 font-inter">Loading projects...</span>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Projects Overview" subtitle="Manage all construction projects and their progress">
        <Card className="gradient-card border-0 shadow-brand">
          <CardContent className="text-center py-12">
            <h3 className="font-montserrat font-bold text-lg text-destructive mb-2">
              Error Loading Projects
            </h3>
            <p className="font-inter text-muted-foreground">
              Failed to load projects. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Projects Overview" subtitle="Manage all construction projects and their progress">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-montserrat font-bold text-foreground">
                    ${(totalBudget / 1000000).toFixed(1)}M
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-montserrat font-bold text-success">
                    {activeProjects}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Completed</p>
                  <p className="text-2xl font-montserrat font-bold text-info">
                    {completedProjects}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Budget Used</p>
                  <p className="text-2xl font-montserrat font-bold text-warning">
                    {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-warning" />
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
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-inter"
              />
            </div>
            
            <div className="flex gap-2">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === "on_hold" ? "On Hold" : status}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="primary" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-montserrat">Create New Project</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_number">Job Number *</Label>
                    <Input
                      id="job_number"
                      value={newProject.job_number}
                      onChange={(e) => setNewProject({...newProject, job_number: e.target.value})}
                      placeholder="Enter job number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select value={newProject.customer_id} onValueChange={(value) => setNewProject({...newProject, customer_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Project Manager</Label>
                    <Select value={newProject.project_manager_id} onValueChange={(value) => setNewProject({...newProject, project_manager_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newProject.location}
                      onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                      placeholder="Enter project location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                      placeholder="Enter budget amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newProject.start_date}
                      onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newProject.end_date}
                      onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateProject}
                    disabled={createProject.isPending}
                  >
                    {createProject.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Projects Display */}
        {view === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && !isLoading && (
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-montserrat font-bold text-lg text-foreground mb-2">
                No Projects Found
              </h3>
              <p className="font-inter text-muted-foreground mb-4">
                {searchTerm ? "No projects match your search criteria." : "No projects available."}
              </p>
              <Button variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ProjectsOverview;