import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const LocationManagement = () => {
  return (
    <AppLayout title="Location Management" subtitle="Manage warehouse locations">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <MapPin className="h-5 w-5 text-primary" />
            Location Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Location management coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default LocationManagement;