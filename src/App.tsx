import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Authentication & User Profile
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/auth/Profile";
import Setup2FA from "./pages/auth/Setup2FA";

// Global Application Interface
import NotificationCenter from "./pages/NotificationCenter";

// Worker-Specific Screens
import WorkerProjectSelection from "./pages/worker/ProjectSelection";
import WorkerInventory from "./pages/worker/Inventory";
import BarcodeScanning from "./pages/worker/BarcodeScanning";
import WorkerRequisitions from "./pages/worker/Requisitions";
import WorkerEquipment from "./pages/worker/Equipment";

// Dashboard & Analytics
import ReportBuilder from "./pages/reports/ReportBuilder";
import SavedReports from "./pages/reports/SavedReports";
import ForecastingDashboard from "./pages/reports/ForecastingDashboard";

// Inventory
import InventoryOverview from "./pages/inventory/InventoryOverview";
import ProductDetail from "./pages/inventory/ProductDetail";
import LocationManagement from "./pages/inventory/LocationManagement";
import InventoryTransfer from "./pages/inventory/InventoryTransfer";
import CycleCount from "./pages/inventory/CycleCount";
import CategoryManagement from "./pages/inventory/CategoryManagement";
import RequisitionApproval from "./pages/inventory/RequisitionApproval";

// Projects
import ProjectsOverview from "./pages/projects/ProjectsOverview";
import ProjectDetail from "./pages/projects/ProjectDetail";
import CustomerManagement from "./pages/projects/CustomerManagement";
import ExpenseManagement from "./pages/projects/ExpenseManagement";
import CustomerInvoicing from "./pages/projects/CustomerInvoicing";

// Procurement & Vendors
import VendorsOverview from "./pages/vendors/VendorsOverview";
import VendorDetail from "./pages/vendors/VendorDetail";
import PurchaseOrderManagement from "./pages/procurement/PurchaseOrderManagement";
import VendorInvoiceManagement from "./pages/procurement/VendorInvoiceManagement";

// Equipment & Assets
import EquipmentOverview from "./pages/equipment/EquipmentOverview";
import EquipmentDetail from "./pages/equipment/EquipmentDetail";
import MaintenanceLog from "./pages/equipment/MaintenanceLog";

// Super Admin Only
import UserManagement from "./pages/admin/UserManagement";
import RolePermissionManagement from "./pages/admin/RolePermissionManagement";
import SystemAuditLog from "./pages/admin/SystemAuditLog";
import SystemSettings from "./pages/admin/SystemSettings";
import DataManagement from "./pages/admin/DataManagement";
import BackupRecovery from "./pages/admin/BackupRecovery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Authentication & User Profile */}
          <Route path="/login" element={<Index />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/setup-2fa" element={<Setup2FA />} />
          
          {/* Global Application Interface */}
          <Route path="/notifications" element={<NotificationCenter />} />
          
          {/* Worker-Specific Screens */}
          <Route path="/worker/projects" element={<WorkerProjectSelection />} />
          <Route path="/worker/inventory" element={<WorkerInventory />} />
          <Route path="/worker/scan" element={<BarcodeScanning />} />
          <Route path="/worker/requisitions" element={<WorkerRequisitions />} />
          <Route path="/worker/equipment" element={<WorkerEquipment />} />
          
          {/* Dashboard & Analytics */}
          <Route path="/reports/builder" element={<ReportBuilder />} />
          <Route path="/reports/saved" element={<SavedReports />} />
          <Route path="/reports/forecasting" element={<ForecastingDashboard />} />
          
          {/* Inventory */}
          <Route path="/inventory" element={<InventoryOverview />} />
          <Route path="/inventory/:id" element={<ProductDetail />} />
          <Route path="/inventory/locations" element={<LocationManagement />} />
          <Route path="/inventory/transfer" element={<InventoryTransfer />} />
          <Route path="/inventory/audit" element={<CycleCount />} />
          <Route path="/inventory/categories" element={<CategoryManagement />} />
          <Route path="/inventory/requisitions" element={<RequisitionApproval />} />
          
          {/* Projects */}
          <Route path="/projects" element={<ProjectsOverview />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/projects/:id/expenses" element={<ExpenseManagement />} />
          <Route path="/projects/:id/invoices" element={<CustomerInvoicing />} />
          
          {/* Procurement & Vendors */}
          <Route path="/vendors" element={<VendorsOverview />} />
          <Route path="/vendors/:id" element={<VendorDetail />} />
          <Route path="/procurement" element={<PurchaseOrderManagement />} />
          <Route path="/procurement/invoices" element={<VendorInvoiceManagement />} />
          
          {/* Equipment & Assets */}
          <Route path="/equipment" element={<EquipmentOverview />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/equipment/maintenance" element={<MaintenanceLog />} />
          
          {/* Super Admin Only */}
          <Route path="/users" element={<UserManagement />} />
          <Route path="/users/roles" element={<RolePermissionManagement />} />
          <Route path="/system/audit" element={<SystemAuditLog />} />
          <Route path="/settings" element={<SystemSettings />} />
          <Route path="/system/data" element={<DataManagement />} />
          <Route path="/system/backup" element={<BackupRecovery />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
