import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Clock, CheckCircle, X, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRequisitions } from "@/hooks/useRequisitions";

const WorkerRequisitions = () => {
  const { myRequisitions, isLoadingMy } = useRequisitions();
  const [searchTerm, setSearchTerm] = useState("");

  const mockRequisitions = [
    {
      id: "REQ-001",
      items: [
        { name: "Concrete Mix #1", quantity: 10, unit: "bags" },
        { name: "Rebar #4", quantity: 5, unit: "pieces" }
      ],
      status: "pending",
      requestDate: "2024-01-15",
      approver: "John Smith",
      notes: "Needed for foundation work"
    },
    {
      id: "REQ-002",
      items: [
        { name: "Portland Cement", quantity: 20, unit: "bags" }
      ],
      status: "approved",
      requestDate: "2024-01-14",
      approver: "Sarah Johnson",
      approvedDate: "2024-01-14",
      notes: "Emergency repair materials"
    },
    {
      id: "REQ-003",
      items: [
        { name: "Aggregate Stone", quantity: 2, unit: "tons" }
      ],
      status: "rejected",
      requestDate: "2024-01-13",
      approver: "Mike Wilson",
      rejectedDate: "2024-01-13",
      rejectionReason: "Over project budget",
      notes: "For parking lot expansion"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { variant: "warning", label: "Pending", icon: Clock };
      case "approved":
        return { variant: "success", label: "Approved", icon: CheckCircle };
      case "rejected":
        return { variant: "destructive", label: "Rejected", icon: X };
      default:
        return { variant: "secondary", label: status, icon: FileText };
    }
  };

  // Use real data if available, otherwise fall back to mock data
  const displayRequisitions = myRequisitions.length > 0 ? myRequisitions : mockRequisitions;
  
  const filteredRequisitions = displayRequisitions.filter(req =>
    (req.requisition_number || req.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.requisition_items || req.items)?.some((item: any) => 
      (item.product?.name || item.name)?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <AppLayout title="My Requisitions" subtitle="Track your material requests">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search requisitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-inter"
            />
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Requisition
          </Button>
        </div>

        {/* Requisitions List */}
        <div className="space-y-4">
          {isLoadingMy ? (
            <Card className="gradient-card border-0 shadow-brand">
              <CardContent className="text-center py-12">
                Loading your requisitions...
              </CardContent>
            </Card>
          ) : (
            filteredRequisitions.map((requisition) => {
              const statusBadge = getStatusBadge(requisition.status);
              const StatusIcon = statusBadge.icon;
              
              return (
                <Card key={requisition.id} className="gradient-card border-0 shadow-brand">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 font-montserrat">
                          <FileText className="h-5 w-5 text-primary" />
                          {requisition.requisition_number || requisition.id}
                        </CardTitle>
                        <CardDescription className="font-inter">
                          Requested on {new Date(requisition.created_at || requisition.requestDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={statusBadge.variant as any}
                        className="flex items-center gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusBadge.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div>
                      <h4 className="font-inter font-semibold text-sm text-foreground mb-2">
                        Requested Items:
                      </h4>
                      <div className="space-y-1">
                        {(requisition.requisition_items || requisition.items || []).map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                            <span className="font-inter text-sm">
                              {item.product?.name || item.name}
                            </span>
                            <span className="font-inter text-sm font-medium">
                              {item.quantity_requested || item.quantity} {item.product?.unit_of_measure || item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {requisition.notes && (
                      <div>
                        <h4 className="font-inter font-semibold text-sm text-foreground mb-1">
                          Notes:
                        </h4>
                        <p className="font-inter text-sm text-muted-foreground">
                          {requisition.notes}
                        </p>
                      </div>
                    )}

                    {/* Status Details */}
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-inter text-muted-foreground">Project:</span>
                        <span className="font-inter font-medium">
                          {requisition.project?.name || 'N/A'}
                        </span>
                      </div>
                      
                      {requisition.status === "approved" && requisition.approved_date && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-inter text-muted-foreground">Approved:</span>
                          <span className="font-inter font-medium">
                            {new Date(requisition.approved_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {requisition.status === "rejected" && (
                        <div className="mt-2">
                          <span className="font-inter text-sm text-muted-foreground">Status: </span>
                          <span className="font-inter text-sm text-destructive">
                            Rejected
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {filteredRequisitions.length === 0 && (
          <Card className="gradient-card border-0 shadow-brand">
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-montserrat font-bold text-lg text-foreground mb-2">
                No Requisitions Found
              </h3>
              <p className="font-inter text-muted-foreground mb-4">
                {searchTerm ? "No requisitions match your search criteria." : "You haven't submitted any requisitions yet."}
              </p>
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Create New Requisition
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default WorkerRequisitions;