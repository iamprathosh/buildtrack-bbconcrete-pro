import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, User, Calendar, Search, CheckCircle, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const WorkerEquipment = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const availableEquipment = [
    {
      id: "EQ-001",
      name: "Concrete Mixer - Large",
      type: "Machinery",
      condition: "Good",
      location: "Equipment Yard A",
      lastMaintenance: "2024-01-10"
    },
    {
      id: "EQ-002",
      name: "Power Drill Set",
      type: "Tools",
      condition: "Excellent",
      location: "Tool Storage B",
      lastMaintenance: "2024-01-05"
    },
    {
      id: "EQ-003",
      name: "Safety Harness",
      type: "Safety",
      condition: "Good",
      location: "Safety Equipment Room",
      lastMaintenance: "2024-01-12"
    }
  ];

  const checkedOutEquipment = [
    {
      id: "EQ-004",
      name: "Welding Machine",
      type: "Machinery",
      checkedOutDate: "2024-01-14",
      dueDate: "2024-01-16",
      condition: "Good"
    },
    {
      id: "EQ-005",
      name: "Level - 4ft",
      type: "Tools",
      checkedOutDate: "2024-01-13",
      dueDate: "2024-01-15",
      condition: "Excellent"
    }
  ];

  const getConditionBadge = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent":
        return { variant: "success", label: "Excellent" };
      case "good":
        return { variant: "info", label: "Good" };
      case "fair":
        return { variant: "warning", label: "Fair" };
      case "poor":
        return { variant: "destructive", label: "Poor" };
      default:
        return { variant: "secondary", label: condition };
    }
  };

  const filteredAvailable = availableEquipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCheckedOut = checkedOutEquipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout title="Equipment Management" subtitle="Check out and return company equipment">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-inter"
          />
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available" className="flex items-center gap-2">
              Available ({filteredAvailable.length})
            </TabsTrigger>
            <TabsTrigger value="checked-out" className="flex items-center gap-2">
              Checked Out ({filteredCheckedOut.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4 mt-6">
            {filteredAvailable.map((equipment) => {
              const conditionBadge = getConditionBadge(equipment.condition);
              
              return (
                <Card key={equipment.id} className="gradient-card border-0 shadow-brand">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 font-montserrat">
                          <Wrench className="h-5 w-5 text-primary" />
                          {equipment.name}
                        </CardTitle>
                        <CardDescription className="font-inter">
                          {equipment.id} • {equipment.type}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge 
                          variant={conditionBadge.variant as any}
                          className="text-xs"
                        >
                          {conditionBadge.label}
                        </Badge>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          Available
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-inter text-muted-foreground">Location:</span>
                        <p className="font-inter font-medium">{equipment.location}</p>
                      </div>
                      <div>
                        <span className="font-inter text-muted-foreground">Last Maintenance:</span>
                        <p className="font-inter font-medium">
                          {new Date(equipment.lastMaintenance).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="primary" size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredAvailable.length === 0 && (
              <Card className="gradient-card border-0 shadow-brand">
                <CardContent className="text-center py-12">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-montserrat font-bold text-lg text-foreground mb-2">
                    No Available Equipment
                  </h3>
                  <p className="font-inter text-muted-foreground">
                    {searchTerm ? "No equipment matches your search criteria." : "All equipment is currently checked out."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="checked-out" className="space-y-4 mt-6">
            {filteredCheckedOut.map((equipment) => {
              const conditionBadge = getConditionBadge(equipment.condition);
              const isOverdue = new Date(equipment.dueDate) < new Date();
              
              return (
                <Card key={equipment.id} className="gradient-card border-0 shadow-brand">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 font-montserrat">
                          <Wrench className="h-5 w-5 text-primary" />
                          {equipment.name}
                        </CardTitle>
                        <CardDescription className="font-inter">
                          {equipment.id} • {equipment.type}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge 
                          variant={conditionBadge.variant as any}
                          className="text-xs"
                        >
                          {conditionBadge.label}
                        </Badge>
                        <Badge 
                          variant={isOverdue ? "destructive" : "outline"}
                          className="text-xs flex items-center gap-1"
                        >
                          <User className="h-3 w-3" />
                          {isOverdue ? "Overdue" : "Checked Out"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-inter text-muted-foreground">Checked Out:</span>
                        <p className="font-inter font-medium">
                          {new Date(equipment.checkedOutDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-inter text-muted-foreground">Due Date:</span>
                        <p className={`font-inter font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                          {new Date(equipment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {isOverdue && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm font-inter text-destructive">
                          ⚠️ This equipment is overdue for return. Please return it as soon as possible.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button variant="success" size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Return Equipment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredCheckedOut.length === 0 && (
              <Card className="gradient-card border-0 shadow-brand">
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-montserrat font-bold text-lg text-foreground mb-2">
                    No Equipment Checked Out
                  </h3>
                  <p className="font-inter text-muted-foreground">
                    {searchTerm ? "No checked out equipment matches your search." : "You haven't checked out any equipment yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default WorkerEquipment;