import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AdvancedChart } from '@/components/analytics/AdvancedChart';
import { useAdvancedAnalytics, DateRange } from '@/hooks/useAdvancedAnalytics';
import { MobileOptimized, MobileGrid } from '@/components/mobile/MobileOptimized';
import { BarChart3, TrendingUp, DollarSign, Package, Calendar, Download, Filter, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdvancedReports = () => {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  
  const { 
    kpiData, 
    projectChart, 
    inventoryChart, 
    financialChart, 
    isLoading,
    kpiLoading,
    projectChartLoading,
    inventoryChartLoading,
    financialChartLoading
  } = useAdvancedAnalytics({
    dateRange,
    projectId: selectedProject === 'all' ? undefined : selectedProject
  });

  // Handle loading state
  if (isLoading) {
    return (
      <AppLayout title="Advanced Reports" subtitle="Comprehensive analytics and insights">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const formatValue = (value: number, format: 'number' | 'currency' | 'percentage') => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout title="Advanced Reports" subtitle="Comprehensive analytics and insights">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="gradient-card border-0 shadow-brand">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle className="font-montserrat">Report Filters</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MobileOptimized
              mobileClassName="space-y-4"
              desktopClassName="flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="project-1">Downtown Office Complex</SelectItem>
                  <SelectItem value="project-2">Highway Bridge Repair</SelectItem>
                  <SelectItem value="project-3">Residential Complex</SelectItem>
                </SelectContent>
              </Select>
            </MobileOptimized>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        {kpiData && (
          <MobileGrid cols={{ mobile: 1, tablet: 2, desktop: 5 }}>
            {kpiData.map((kpi, index) => (
              <Card key={index} className="gradient-card border-0 shadow-brand">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {kpi.label}
                    </span>
                    {getTrendIcon(kpi.trend)}
                  </div>
                  <div className="text-2xl font-bold font-montserrat">
                    {formatValue(kpi.value, kpi.format)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant={kpi.trend === 'up' ? 'default' : kpi.trend === 'down' ? 'destructive' : 'secondary'}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </MobileGrid>
        )}

        {/* Charts */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <MobileGrid cols={{ mobile: 1, tablet: 1, desktop: 2 }}>
              {projectChart && (
                <AdvancedChart
                  type="pie"
                  data={projectChart}
                  title="Project Status Distribution"
                  description="Current status of all projects"
                  xKey="name"
                  yKey="value"
                />
              )}
              
              <Card className="gradient-card border-0 shadow-brand">
                <CardHeader>
                  <CardTitle className="font-montserrat">Project Performance</CardTitle>
                  <CardDescription>Key project metrics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                      <span className="font-medium">On-time Completion Rate</span>
                      <Badge variant="default">87%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                      <span className="font-medium">Budget Variance</span>
                      <Badge variant="secondary">-2.5%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                      <span className="font-medium">Resource Utilization</span>
                      <Badge variant="default">92%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MobileGrid>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <MobileGrid cols={{ mobile: 1, tablet: 1, desktop: 2 }}>
              {inventoryChart && (
                <AdvancedChart
                  type="line"
                  data={inventoryChart}
                  title="Inventory Movement Trends"
                  description="Daily stock in/out balance"
                  xKey="name"
                  yKey="value"
                />
              )}
              
              <Card className="gradient-card border-0 shadow-brand">
                <CardHeader>
                  <CardTitle className="font-montserrat">Inventory Insights</CardTitle>
                  <CardDescription>Stock levels and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg">
                      <span className="font-medium text-warning">Low Stock Items</span>
                      <Badge variant="outline" className="border-warning text-warning">12</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-alert/10 rounded-lg">
                      <span className="font-medium text-alert">Critical Stock</span>
                      <Badge variant="outline" className="border-alert text-alert">3</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                      <span className="font-medium text-success">Optimal Stock</span>
                      <Badge variant="outline" className="border-success text-success">156</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MobileGrid>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <MobileGrid cols={{ mobile: 1, tablet: 1, desktop: 2 }}>
              {financialChart && (
                <AdvancedChart
                  type="bar"
                  data={financialChart}
                  title="Financial Overview"
                  description="Revenue vs expenses by category"
                  xKey="name"
                  yKey="value"
                />
              )}
              
              <Card className="gradient-card border-0 shadow-brand">
                <CardHeader>
                  <CardTitle className="font-montserrat">Financial Health</CardTitle>
                  <CardDescription>Key financial indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                      <span className="font-medium">Profit Margin</span>
                      <Badge variant="default">18.5%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                      <span className="font-medium">Cash Flow</span>
                      <Badge variant="default">+$125K</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                      <span className="font-medium">Outstanding Invoices</span>
                      <Badge variant="secondary">$45K</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MobileGrid>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdvancedReports;