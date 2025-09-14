import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, Download, Play, Save, Settings } from "lucide-react";

const ReportBuilder = () => {
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("");

  const modules = [
    { value: "inventory", label: "Inventory", description: "Stock levels, movements, and valuations" },
    { value: "projects", label: "Projects", description: "Project progress, budgets, and timelines" },
    { value: "procurement", label: "Procurement", description: "Purchase orders, vendors, and costs" },
    { value: "equipment", label: "Equipment", description: "Equipment usage, maintenance, and costs" },
    { value: "users", label: "Users", description: "User activity and performance metrics" }
  ];

  const fieldsByModule = {
    inventory: [
      { id: "item_name", label: "Item Name" },
      { id: "sku", label: "SKU" },
      { id: "category", label: "Category" },
      { id: "quantity", label: "Current Quantity" },
      { id: "unit_cost", label: "Unit Cost" },
      { id: "total_value", label: "Total Value" },
      { id: "supplier", label: "Supplier" },
      { id: "location", label: "Location" },
      { id: "last_updated", label: "Last Updated" }
    ],
    projects: [
      { id: "project_name", label: "Project Name" },
      { id: "client", label: "Client" },
      { id: "status", label: "Status" },
      { id: "progress", label: "Progress %" },
      { id: "budget", label: "Budget" },
      { id: "spent", label: "Amount Spent" },
      { id: "start_date", label: "Start Date" },
      { id: "end_date", label: "End Date" },
      { id: "manager", label: "Project Manager" }
    ],
    procurement: [
      { id: "po_number", label: "PO Number" },
      { id: "vendor", label: "Vendor" },
      { id: "total_amount", label: "Total Amount" },
      { id: "status", label: "Status" },
      { id: "order_date", label: "Order Date" },
      { id: "delivery_date", label: "Delivery Date" },
      { id: "items", label: "Items Ordered" }
    ],
    equipment: [
      { id: "equipment_name", label: "Equipment Name" },
      { id: "equipment_id", label: "Equipment ID" },
      { id: "type", label: "Type" },
      { id: "condition", label: "Condition" },
      { id: "location", label: "Location" },
      { id: "checked_out_by", label: "Checked Out By" },
      { id: "last_maintenance", label: "Last Maintenance" }
    ],
    users: [
      { id: "user_name", label: "User Name" },
      { id: "role", label: "Role" },
      { id: "last_login", label: "Last Login" },
      { id: "projects_assigned", label: "Projects Assigned" },
      { id: "activity_level", label: "Activity Level" }
    ]
  };

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const currentFields = selectedModule ? fieldsByModule[selectedModule as keyof typeof fieldsByModule] || [] : [];

  const savedReports = [
    { id: 1, name: "Monthly Inventory Report", module: "Inventory", lastRun: "2024-01-15", size: "2.3 MB" },
    { id: 2, name: "Project Progress Summary", module: "Projects", lastRun: "2024-01-14", size: "1.8 MB" },
    { id: 3, name: "Vendor Performance", module: "Procurement", lastRun: "2024-01-13", size: "950 KB" },
    { id: 4, name: "Equipment Utilization", module: "Equipment", lastRun: "2024-01-12", size: "1.2 MB" }
  ];

  return (
    <AppLayout title="Report Builder" subtitle="Create custom reports and analytics">
      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Report Builder
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Saved Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="gradient-card border-0 shadow-brand">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-montserrat">
                    <Settings className="h-5 w-5 text-primary" />
                    Report Configuration
                  </CardTitle>
                  <CardDescription className="font-inter">
                    Configure your custom report settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportName" className="font-inter font-medium">Report Name</Label>
                      <Input
                        id="reportName"
                        placeholder="Enter report name"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        className="font-inter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateRange" className="font-inter font-medium">Date Range</Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="font-inter">
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-7-days">Last 7 days</SelectItem>
                          <SelectItem value="last-30-days">Last 30 days</SelectItem>
                          <SelectItem value="last-3-months">Last 3 months</SelectItem>
                          <SelectItem value="last-6-months">Last 6 months</SelectItem>
                          <SelectItem value="last-year">Last year</SelectItem>
                          <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-inter font-medium">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter report description"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      className="font-inter"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Module Selection */}
              <Card className="gradient-card border-0 shadow-brand">
                <CardHeader>
                  <CardTitle className="font-montserrat">Data Source</CardTitle>
                  <CardDescription className="font-inter">
                    Select the module to generate reports from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modules.map((module) => (
                      <div
                        key={module.value}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedModule === module.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedModule(module.value)}
                      >
                        <h4 className="font-inter font-semibold text-foreground">{module.label}</h4>
                        <p className="text-sm font-inter text-muted-foreground mt-1">
                          {module.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Field Selection */}
              {selectedModule && (
                <Card className="gradient-card border-0 shadow-brand">
                  <CardHeader>
                    <CardTitle className="font-montserrat">Data Fields</CardTitle>
                    <CardDescription className="font-inter">
                      Select the fields to include in your report
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentFields.map((field) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={field.id}
                            checked={selectedFields.includes(field.id)}
                            onCheckedChange={() => handleFieldToggle(field.id)}
                          />
                          <Label
                            htmlFor={field.id}
                            className="font-inter text-sm cursor-pointer"
                          >
                            {field.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Preview Panel */}
            <div className="space-y-6">
              <Card className="gradient-card border-0 shadow-brand">
                <CardHeader>
                  <CardTitle className="font-montserrat">Report Preview</CardTitle>
                  <CardDescription className="font-inter">
                    Preview your report configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-inter">
                      <span className="text-muted-foreground">Name: </span>
                      <span className="font-medium">{reportName || "Untitled Report"}</span>
                    </div>
                    <div className="text-sm font-inter">
                      <span className="text-muted-foreground">Module: </span>
                      <span className="font-medium">{selectedModule ? modules.find(m => m.value === selectedModule)?.label : "None"}</span>
                    </div>
                    <div className="text-sm font-inter">
                      <span className="text-muted-foreground">Fields: </span>
                      <span className="font-medium">{selectedFields.length} selected</span>
                    </div>
                    <div className="text-sm font-inter">
                      <span className="text-muted-foreground">Date Range: </span>
                      <span className="font-medium">{dateRange || "Not set"}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border/50">
                    <Button 
                      variant="primary" 
                      className="w-full"
                      disabled={!reportName || !selectedModule || selectedFields.length === 0}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card className="gradient-card border-0 shadow-brand">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-montserrat">
                <FileText className="h-5 w-5 text-primary" />
                Saved Reports
              </CardTitle>
              <CardDescription className="font-inter">
                Access and manage your saved report configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="flex-1">
                      <h4 className="font-inter font-semibold text-foreground">{report.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="font-inter">Module: {report.module}</span>
                        <span className="font-inter">Last run: {new Date(report.lastRun).toLocaleDateString()}</span>
                        <span className="font-inter">Size: {report.size}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default ReportBuilder;