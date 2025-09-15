import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Wrench,
  AlertTriangle,
  Calendar,
  Activity,
  Target,
  Zap,
  Download,
  FileText,
  BarChart3
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface EquipmentAnalyticsProps {
  equipmentId?: string;
}

interface EquipmentMetrics {
  id: string;
  name: string;
  category: string;
  totalUsageHours: number;
  maintenanceCosts: number;
  utilizationRate: number;
  downtime: number;
  maintenanceFrequency: number;
  efficiency: number;
}

interface MaintenanceTrend {
  month: string;
  preventive: number;
  corrective: number;
  costs: number;
}

interface UtilizationData {
  equipment: string;
  utilization: number;
  target: number;
  category: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function EquipmentAnalytics({ equipmentId }: EquipmentAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<string>('3m');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Calculate date range based on selection
  const dateRange = useMemo(() => {
    const end = new Date();
    let start: Date;
    
    switch (timeRange) {
      case '1m':
        start = subMonths(end, 1);
        break;
      case '3m':
        start = subMonths(end, 3);
        break;
      case '6m':
        start = subMonths(end, 6);
        break;
      case '1y':
        start = subMonths(end, 12);
        break;
      default:
        start = subMonths(end, 3);
    }
    
    return { start, end };
  }, [timeRange]);

  // Fetch equipment data with analytics
  const { data: equipmentMetrics = [], isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['equipment-analytics', equipmentId, timeRange],
    queryFn: async (): Promise<EquipmentMetrics[]> => {
      // This would be a complex query in real implementation
      // For now, we'll simulate the data structure
      let query = supabase
        .from('equipment')
        .select(`
          id,
          name,
          category,
          equipment_logs (
            id,
            checkout_time,
            checkin_time,
            hours_used
          ),
          maintenance_tasks (
            id,
            cost_estimate,
            completed_date,
            task_type
          )
        `)
        .eq('status', 'active');

      if (equipmentId) {
        query = query.eq('id', equipmentId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process the data to calculate metrics
      return data.map(equipment => {
        const logs = equipment.equipment_logs || [];
        const maintenanceTasks = equipment.maintenance_tasks || [];
        
        const totalUsageHours = logs.reduce((sum, log) => sum + (log.hours_used || 0), 0);
        const maintenanceCosts = maintenanceTasks
          .filter(task => task.completed_date)
          .reduce((sum, task) => sum + (task.cost_estimate || 0), 0);
        
        const utilizationRate = Math.random() * 100; // Would calculate based on actual usage vs available time
        const downtime = Math.random() * 10; // Would calculate based on maintenance periods
        const maintenanceFrequency = maintenanceTasks.length;
        const efficiency = Math.max(0, 100 - downtime - (100 - utilizationRate) * 0.5);

        return {
          id: equipment.id,
          name: equipment.name,
          category: equipment.category,
          totalUsageHours,
          maintenanceCosts,
          utilizationRate,
          downtime,
          maintenanceFrequency,
          efficiency
        };
      });
    }
  });

  // Fetch maintenance trends
  const { data: maintenanceTrends = [], isLoading: isLoadingTrends } = useQuery({
    queryKey: ['maintenance-trends', timeRange],
    queryFn: async (): Promise<MaintenanceTrend[]> => {
      // Generate sample trend data - in real implementation, this would aggregate actual data
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        months.push({
          month: format(date, 'MMM yyyy'),
          preventive: Math.floor(Math.random() * 20) + 5,
          corrective: Math.floor(Math.random() * 15) + 2,
          costs: Math.floor(Math.random() * 10000) + 5000
        });
      }
      return months;
    }
  });

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!equipmentMetrics.length) return null;

    const totalEquipment = equipmentMetrics.length;
    const avgUtilization = equipmentMetrics.reduce((sum, eq) => sum + eq.utilizationRate, 0) / totalEquipment;
    const totalMaintenanceCosts = equipmentMetrics.reduce((sum, eq) => sum + eq.maintenanceCosts, 0);
    const avgEfficiency = equipmentMetrics.reduce((sum, eq) => sum + eq.efficiency, 0) / totalEquipment;
    const highUtilization = equipmentMetrics.filter(eq => eq.utilizationRate > 80).length;
    const needsAttention = equipmentMetrics.filter(eq => eq.efficiency < 70).length;

    return {
      totalEquipment,
      avgUtilization,
      totalMaintenanceCosts,
      avgEfficiency,
      highUtilization,
      needsAttention
    };
  }, [equipmentMetrics]);

  // Get utilization data for chart
  const utilizationData = useMemo(() => {
    return equipmentMetrics.map(eq => ({
      equipment: eq.name.length > 15 ? eq.name.substring(0, 15) + '...' : eq.name,
      utilization: Math.round(eq.utilizationRate),
      target: 85,
      category: eq.category
    }));
  }, [equipmentMetrics]);

  // Get category distribution
  const categoryData = useMemo(() => {
    const categories = equipmentMetrics.reduce((acc, eq) => {
      acc[eq.category] = (acc[eq.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [equipmentMetrics]);

  // Get top performers and underperformers
  const topPerformers = useMemo(() => {
    return [...equipmentMetrics]
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 5);
  }, [equipmentMetrics]);

  const underPerformers = useMemo(() => {
    return [...equipmentMetrics]
      .filter(eq => eq.efficiency < 70)
      .sort((a, b) => a.efficiency - b.efficiency)
      .slice(0, 5);
  }, [equipmentMetrics]);

  const exportReport = () => {
    // In real implementation, this would generate and download a PDF/Excel report
    console.log('Exporting equipment analytics report...');
  };

  if (isLoadingMetrics || isLoadingTrends) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Equipment Analytics</h2>
          <p className="text-muted-foreground">Performance insights and utilization reports</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{summaryStats.totalEquipment}</p>
                  <p className="text-sm text-muted-foreground">Total Equipment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{summaryStats.avgUtilization.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Avg Utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">${summaryStats.totalMaintenanceCosts.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Maintenance Costs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{summaryStats.avgEfficiency.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Avg Efficiency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{summaryStats.highUtilization}</p>
                  <p className="text-sm text-muted-foreground">High Utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{summaryStats.needsAttention}</p>
                  <p className="text-sm text-muted-foreground">Need Attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="utilization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        {/* Utilization Tab */}
        <TabsContent value="utilization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Utilization</CardTitle>
                  <CardDescription>Current utilization vs target (85%)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={utilizationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="equipment" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="target" fill="#e5e7eb" name="Target (85%)" />
                      <Bar dataKey="utilization" fill="#3b82f6" name="Current Utilization" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Equipment by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {categoryData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Trends</CardTitle>
              <CardDescription>Preventive vs corrective maintenance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={maintenanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="preventive" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    name="Preventive"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="corrective" 
                    stackId="1" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    name="Corrective"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>Equipment with highest efficiency ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.map((equipment, index) => (
                    <div key={equipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{equipment.name}</h4>
                          <p className="text-sm text-muted-foreground">{equipment.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-700">
                          {equipment.efficiency.toFixed(1)}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {equipment.totalUsageHours}h used
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Needs Attention
                </CardTitle>
                <CardDescription>Equipment requiring maintenance or optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {underPerformers.length > 0 ? (
                    underPerformers.map((equipment, index) => (
                      <div key={equipment.id} className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                            !
                          </div>
                          <div>
                            <h4 className="font-medium">{equipment.name}</h4>
                            <p className="text-sm text-muted-foreground">{equipment.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {equipment.efficiency.toFixed(1)}%
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {equipment.downtime.toFixed(1)}% downtime
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>All equipment performing well!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Cost Trends</CardTitle>
              <CardDescription>Monthly maintenance expenditure</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={maintenanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Cost']} />
                  <Line 
                    type="monotone" 
                    dataKey="costs" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Monthly Costs"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Equipment with highest maintenance costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...equipmentMetrics]
                    .sort((a, b) => b.maintenanceCosts - a.maintenanceCosts)
                    .slice(0, 5)
                    .map((equipment) => (
                      <div key={equipment.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{equipment.name}</h4>
                          <p className="text-xs text-muted-foreground">{equipment.category}</p>
                        </div>
                        <span className="font-bold text-sm">
                          ${equipment.maintenanceCosts.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-green-500 mb-2">
                  ${((summaryStats?.totalMaintenanceCosts || 0) / (summaryStats?.totalEquipment || 1)).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Average cost per equipment</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingDown className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  12%
                </div>
                <p className="text-sm text-muted-foreground">Cost reduction vs last period</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
