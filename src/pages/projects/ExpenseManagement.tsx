import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

const ExpenseManagement = () => {
  return (
    <AppLayout title="Expense Management" subtitle="Track project expenses">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <DollarSign className="h-5 w-5 text-primary" />
            Expense Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Expense management coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ExpenseManagement;