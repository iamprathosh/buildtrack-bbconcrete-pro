import { useState } from 'react';
import { useVendors } from '@/hooks/useVendors';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { DataTable } from "../components/ui/data-table";
import { columns } from "@/components/vendors/columns";
import { VendorDialog } from '@/components/vendors/VendorDialog';
import { PlusCircle, Truck } from "lucide-react";

const VendorsOverview = () => {
  const { vendors, isLoading } = useVendors();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setIsDialogOpen(true);
  };

  const handleDelete = (vendor) => {
    // Implement delete confirmation dialog if needed
    console.log('Delete', vendor);
  };

  return (
    <AppLayout title="Vendors Overview" subtitle="Manage supplier relationships">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 font-montserrat">
              <Truck className="h-5 w-5 text-primary" />
              Vendors
            </CardTitle>
            <Button onClick={() => {
              setSelectedVendor(null);
              setIsDialogOpen(true);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* TODO: Implement vendor table similar to customer management */}
          <div className="text-center py-8 text-muted-foreground">
            Vendor management table needs to be updated to use standard Table components.
            {isLoading ? ' Loading...' : ` Found ${vendors?.length || 0} vendors.`}
          </div>
        </CardContent>
      </Card>
      <VendorDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        vendor={selectedVendor}
      />
    </AppLayout>
  );
};

export default VendorsOverview;
