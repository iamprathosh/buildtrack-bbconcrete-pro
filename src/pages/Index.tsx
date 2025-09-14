import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div>
        <LoginForm />
        {/* Demo button to skip login for testing */}
        <div className="fixed bottom-4 right-4">
          <Button
            onClick={() => setIsAuthenticated(true)}
            variant="outline"
            size="sm"
          >
            Demo Access
          </Button>
        </div>
      </div>
    );
  }

  // Main Dashboard
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
            <StatsCard
              title="Total Inventory Value"
              value="$847,230"
              change="+12% from last month"
              changeType="positive"
              icon={Package}
            />
            <StatsCard
              title="Active Projects"
              value="24"
              change="3 starting this week"
              changeType="positive"
              icon={Building2}
            />
            <StatsCard
              title="Low Stock Items"
              value="8"
              change="Requires attention"
              changeType="negative"
              icon={AlertTriangle}
            />
            <StatsCard
              title="Team Members"
              value="42"
              change="2 new hires"
              changeType="positive"
              icon={Users}
            />
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
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <div className="flex-1">
                    <p className="text-sm font-inter font-medium">Concrete delivered to Site A</p>
                    <p className="text-xs text-muted-foreground font-inter">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 rounded-full bg-warning"></div>
                  <div className="flex-1">
                    <p className="text-sm font-inter font-medium">Low stock alert: Rebar #4</p>
                    <p className="text-xs text-muted-foreground font-inter">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 rounded-full bg-info"></div>
                  <div className="flex-1">
                    <p className="text-sm font-inter font-medium">New purchase order created</p>
                    <p className="text-xs text-muted-foreground font-inter">6 hours ago</p>
                  </div>
                </div>
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
                <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                  <Package className="h-6 w-6 text-primary" />
                  <span className="text-sm font-inter">Add Inventory</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  <span className="text-sm font-inter">New Project</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                  <Truck className="h-6 w-6 text-primary" />
                  <span className="text-sm font-inter">Create PO</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <span className="text-sm font-inter">View Reports</span>
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
                {[
                  { name: "Downtown Office Complex", progress: 75, status: "On Track", budget: "$1.2M" },
                  { name: "Residential Building A", progress: 45, status: "Behind Schedule", budget: "$850K" },
                  { name: "Highway Bridge Repair", progress: 90, status: "Ahead of Schedule", budget: "$2.1M" },
                ].map((project, index) => (
                  <div key={index} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-inter font-semibold text-foreground">{project.name}</h4>
                        <p className="text-sm text-muted-foreground font-inter">Budget: {project.budget}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-inter font-medium ${
                        project.status === 'On Track' ? 'bg-success/20 text-success' :
                        project.status === 'Behind Schedule' ? 'bg-warning/20 text-warning' :
                        'bg-info/20 text-info'
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
                    <p className="text-xs text-muted-foreground font-inter mt-1">{project.progress}% Complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Index;
