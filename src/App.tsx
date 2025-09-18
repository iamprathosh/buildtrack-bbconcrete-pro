import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkAuthGuard } from "./components/auth/ClerkAuth";
import { AuthProvider } from "./contexts/AuthContext";
import { SupabaseProvider } from "./providers/SupabaseProvider";
import { ActivityProvider } from "./providers/ActivityProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DebugPage from "./pages/DebugPage";
import AuthDebug from "./pages/AuthDebug";
import SimpleTest from "./pages/SimpleTest";

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
import WorkerOperations from "./pages/worker/WorkerOperations";
import WorkerOperationsDebug from "./components/debug/WorkerOperationsDebug";

// Dashboard & Analytics
import ReportBuilder from "./pages/reports/ReportBuilder";
import SavedReports from "./pages/reports/SavedReports";
import ForecastingDashboard from "./pages/reports/ForecastingDashboard";

// Inventory
import InventoryOverview from "./pages/inventory/InventoryOverview";
import ProductDetail from "./pages/inventory/ProductDetail";
import AddProduct from "./pages/inventory/AddProduct";
import BulkImport from "./pages/inventory/BulkImport";
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
import AdvancedSettings from "./pages/admin/AdvancedSettings";
import AdvancedReports from "./pages/reports/AdvancedReports";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: (failureCount, error: any) => {
        // Don't retry for authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 2;
      }
    },
    mutations: {
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Test route outside auth guard */}
            <Route path="/test" element={<SimpleTest />} />
          </Routes>
          <ClerkAuthGuard>
            <SupabaseProvider>
                <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/debug" element={<DebugPage />} />
            <Route path="/auth-debug" element={<AuthDebug />} />
            <Route path="/worker-operations-debug" element={<WorkerOperationsDebug />} />
            <Route path="/rls-debug" element={<div className="p-6"><div className="max-w-4xl mx-auto"><h1 className="text-2xl font-bold mb-4">RLS Debug Dashboard</h1><p>RLS policies have been temporarily opened to allow full access. You can now access /users and all other pages.</p></div></div>} />
            
            {/* Authentication & User Profile */}
            <Route path="/profile" element={<Profile />} />
            
            {/* Global Application Interface */}
            <Route path="/notifications" element={<NotificationCenter />} />
            
            {/* Worker-Specific Screens */}
            <Route path="/worker/projects" element={<WorkerProjectSelection />} />
            <Route path="/worker/inventory" element={<WorkerInventory />} />
            <Route path="/worker/scan" element={<BarcodeScanning />} />
            <Route path="/worker/requisitions" element={<WorkerRequisitions />} />
            <Route path="/worker/equipment" element={<WorkerEquipment />} />
            <Route path="/worker/operations" element={<WorkerOperations />} />
            
            {/* Dashboard & Analytics */}
            <Route path="/reports" element={<AdvancedReports />} />
            <Route path="/reports/builder" element={<ReportBuilder />} />
            <Route path="/reports/saved" element={<SavedReports />} />
            <Route path="/reports/forecasting" element={<ForecastingDashboard />} />
            
            {/* Inventory */}
            <Route path="/inventory" element={<InventoryOverview />} />
            <Route path="/inventory/add" element={<AddProduct />} />
            <Route path="/inventory/bulk-import" element={<BulkImport />} />
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
            <Route path="/settings/advanced" element={<AdvancedSettings />} />
            <Route path="/system/data" element={<DataManagement />} />
            <Route path="/system/backup" element={<BackupRecovery />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
                </Routes>
            </SupabaseProvider>
          </ClerkAuthGuard>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
