import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

const RequisitionApproval = () => {
  return (
    <AppLayout title="Requisition Approval" subtitle="Review and approve requisitions">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Requisition Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Requisition approval coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default RequisitionApproval;