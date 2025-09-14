import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Search, Plus, Calendar, DollarSign, Users, MapPin, Clock } from "lucide-react";

const ProjectsOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const projects = [
    {
      id: "PROJ-001",
      name: "Downtown Office Complex",
      client: "Metro Development Corp",
      status: "active",
      progress: 75,
      budget: 1200000,
      spent: 900000,
      startDate: "2024-01-15",
      endDate: "2024-06-30",
      location: "123 Main Street, Downtown",
      manager: "John Smith",
      teamSize: 12,
      description: "Modern 15-story office building with underground parking"
    },
    {
      id: "PROJ-002", 
      name: "Residential Building A",
      client: "Sunset Homes LLC",
      status: "active",
      progress: 45,
      budget: 850000,
      spent: 382500,
      startDate: "2024-02-01",
      endDate: "2024-08-15",
      location: "456 Oak Avenue, Westside",
      manager: "Sarah Johnson",
      teamSize: 8,
      description: "Luxury residential complex with 24 units"
    },
    {
      id: "PROJ-003",
      name: "Highway Bridge Repair",
      client: "State Transportation Dept",
      status: "active", 
      progress: 90,
      budget: 2100000,
      spent: 1890000,
      startDate: "2023-11-20",
      endDate: "2024-01-31",
      location: "Route 95, Mile Marker 42",
      manager: "Mike Wilson",
      teamSize: 15,
      description: "Critical infrastructure repair and reinforcement"
    },
    {
      id: "PROJ-004",
      name: "Shopping Center Renovation",
      client: "Retail Properties Inc",
      status: "planning",
      progress: 5,
      budget: 750000,
      spent: 37500,
      startDate: "2024-03-01",
      endDate: "2024-07-15",
      location: "789 Commerce Blvd",
      manager: "Lisa Chen",
      teamSize: 6,
      description: "Complete renovation of existing shopping center"
    },
    {
      id: "PROJ-005",
      name: "Municipal Library",
      client: "City of Riverside",
      status: "completed",
      progress: 100,
      budget: 950000,
      spent: 925000,
      startDate: "2023-08-01",
      endDate: "2024-01-15",
      location: "200 Library Lane",
      manager: "David Brown",
      teamSize: 10,
      description: "New public library with community spaces"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { variant: "success", label: "Active" };
      case "planning":
        return { variant: "warning", label: "Planning" };
      case "completed":
        return { variant: "outline", label: "Completed" };
      case "on-hold":
        return { variant: "destructive", label: "On Hold" };
      default:
        return { variant: "secondary", label: status };
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-success";
    if (progress >= 70) return "bg-info";
    if (progress >= 40) return "bg-warning";
    return "bg-primary";
  };

  const statuses = ["all", "active", "planning", "completed", "on-hold"];
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.spent, 0);
  const activeProjects = projects.filter(p => p.status === "active").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;

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
                    {Math.round((totalSpent / totalBudget) * 100)}%
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
                  {status}
                </Button>
              ))}
            </div>
          </div>
          
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const statusBadge = getStatusBadge(project.status);
            const budgetUsed = (project.spent / project.budget) * 100;
            
            return (
              <Card key={project.id} className="gradient-card border-0 shadow-brand hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="font-montserrat font-bold text-lg text-foreground">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="font-inter text-sm mt-1">
                        {project.id} • {project.client}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={statusBadge.variant as any}
                      className="ml-2"
                    >
                      {statusBadge.label}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="font-inter text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-inter text-muted-foreground">Progress</span>
                      <span className="text-sm font-inter font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Budget */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-inter text-muted-foreground">Budget Used</span>
                      <span className="text-sm font-inter font-medium">{budgetUsed.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-inter">
                      <span className="text-muted-foreground">
                        ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-inter text-muted-foreground truncate">
                        {project.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-inter text-muted-foreground">
                        {project.teamSize} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-inter text-muted-foreground">
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-inter text-muted-foreground truncate">
                        {project.manager}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-montserrat font-bold text-lg text-foreground mb-2">
                No Projects Found
              </h3>
              <p className="font-inter text-muted-foreground mb-4">
                {searchTerm ? "No projects match your search criteria." : "No projects available."}
              </p>
              <Button variant="primary">
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