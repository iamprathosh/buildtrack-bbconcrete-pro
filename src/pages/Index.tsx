import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import {
  Package,
  Building2,
  TrendingUp,
  AlertTriangle,
  Users,
  Truck,
  BarChart3,
  Activity,
} from "lucide-react";

const Index = () => {
  // Fetch real dashboard data
  const { 
    stats, 
    recentActivity, 
    activeProjects, 
    stockAlerts,
    isLoading, 
    error 
  } = useDashboard();

  // Show error state if data fetch fails
  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader 
            title="Executive Dashboard" 
            subtitle="Overview of your construction operations"
          />
          <main className="flex-1 overflow-y-auto p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load dashboard data. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          </main>
        </div>
      </div>
    );
  }

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          title="Executive Dashboard" 
          subtitle="Overview of your construction operations"
        />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading state for KPI cards
              <>
                <Card className="gradient-card border-0 shadow-brand">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
                <Card className="gradient-card border-0 shadow-brand">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
                <Card className="gradient-card border-0 shadow-brand">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
                <Card className="gradient-card border-0 shadow-brand">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              </>
            ) : (
              // Real data KPI cards
              <>
                <StatsCard
                  title="Total Inventory Value"
                  value={formatCurrency(stats?.totalInventoryValue || 0)}
                  change={stats?.totalInventoryValue > 0 ? "Based on current stock" : "No inventory data"}
                  changeType={stats?.totalInventoryValue > 0 ? "positive" : "neutral"}
                  icon={Package}
                />
                <StatsCard
                  title="Active Projects"
                  value={stats?.activeProjectsCount?.toString() || "0"}
                  change={stats?.activeProjectsCount > 0 ? "Currently in progress" : "No active projects"}
                  changeType={stats?.activeProjectsCount > 0 ? "positive" : "neutral"}
                  icon={Building2}
                />
                <StatsCard
                  title="Low Stock Items"
                  value={stats?.lowStockItemsCount?.toString() || "0"}
                  change={stats?.lowStockItemsCount > 0 ? "Requires attention" : "Stock levels good"}
                  changeType={stats?.lowStockItemsCount > 0 ? "negative" : "positive"}
                  icon={AlertTriangle}
                />
                <StatsCard
                  title="Team Members"
                  value={stats?.teamMembersCount?.toString() || "0"}
                  change={stats?.teamMembersCount > 0 ? "Active users" : "No team members"}
                  changeType={stats?.teamMembersCount > 0 ? "positive" : "neutral"}
                  icon={Users}
                />
              </>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-montserrat">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="font-inter">
                  Latest inventory and project updates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-80 overflow-y-auto px-6 py-4">
                  <div className="space-y-4">
                    {isLoading ? (
                      // Loading state for activities
                      <>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
                          <Skeleton className="h-2 w-2 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-48 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
                          <Skeleton className="h-2 w-2 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-48 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
                          <Skeleton className="h-2 w-2 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-48 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </>
                    ) : recentActivity && recentActivity.length > 0 ? (
                      // Real activity data - show all activities (removed slice limit)
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            activity.type === 'success' ? 'bg-success' :
                            activity.type === 'warning' ? 'bg-warning' :
                            'bg-info'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-inter font-medium truncate">{activity.description}</p>
                            <p className="text-xs text-muted-foreground font-inter">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      // No activity state
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground font-inter">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Scrollable indicator */}
                {recentActivity && recentActivity.length > 4 && (
                  <div className="px-6 py-2 border-t bg-muted/30">
                    <p className="text-xs text-muted-foreground text-center font-inter">
                      Scroll to see more activities
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-montserrat">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="font-inter">
                  Frequently used functions
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                  <Link to="/inventory/add">
                    <Package className="h-6 w-6 text-primary" />
                    <span className="text-sm font-inter">Add Inventory</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                  <Link to="/projects">
                    <Building2 className="h-6 w-6 text-primary" />
                    <span className="text-sm font-inter">New Project</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                  <Link to="/procurement">
                    <Truck className="h-6 w-6 text-primary" />
                    <span className="text-sm font-inter">Create PO</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                  <Link to="/reports">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    <span className="text-sm font-inter">View Reports</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Projects Overview */}
          <Card className="gradient-card border-0 shadow-brand">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-montserrat">
                <Building2 className="h-5 w-5 text-primary" />
                Active Projects
              </CardTitle>
              <CardDescription className="font-inter">
                Current construction projects and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  // Loading state for projects
                  <>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </>
                ) : activeProjects && activeProjects.length > 0 ? (
                  // Real projects data
                  activeProjects.map((project) => (
                    <Link key={project.id} to={`/projects/${project.id}`} className="block">
                      <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-inter font-semibold text-foreground">{project.name}</h4>
                            <p className="text-sm text-muted-foreground font-inter">
                              Budget: {project.budget > 0 ? formatCurrency(project.budget) : 'Not set'}
                              {project.customer_name && ` • ${project.customer_name}`}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-inter font-medium ${
                            project.status === 'Active' ? 'bg-success/20 text-success' :
                            project.status === 'Planning' ? 'bg-info/20 text-info' :
                            'bg-warning/20 text-warning'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground font-inter mt-1">
                          {project.progress}% Complete
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  // No projects state
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-inter mb-4">No active projects</p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/projects">
                        View All Projects
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Index;
