import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder } from "lucide-react";

const CategoryManagement = () => {
  return (
    <AppLayout title="Category Management" subtitle="Manage product categories">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Folder className="h-5 w-5 text-primary" />
            Category Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Category management coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CategoryManagement;