# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

BuildTrack is a construction management SaaS application built for B&B Concrete Pro. It's a comprehensive inventory, project, and equipment management system with role-based access control and real-time analytics.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM v6
- **State Management**: TanStack Query (React Query) for server state
- **Authentication**: Clerk Auth with custom role-based guards
- **Database**: Supabase (PostgreSQL) with edge functions
- **Development**: Vite dev server, ESLint, TypeScript

## Common Development Commands

### Development
```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint -- --fix
```

### Supabase Local Development
```bash
# Start local Supabase (requires Docker)
supabase start

# Stop local Supabase
supabase stop

# Reset local database
supabase db reset

# Apply migrations
supabase db push
```

## Architecture Overview

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── auth/            # Authentication & authorization
│   ├── layout/          # Layout components (Sidebar, Header)
│   ├── dashboard/       # Dashboard-specific components
│   ├── analytics/       # Charts and reporting components
│   └── [feature]/       # Feature-specific components
├── pages/               # Route components organized by feature
│   ├── Index.tsx        # Main dashboard
│   ├── auth/            # Authentication pages
│   ├── admin/           # Super admin pages
│   ├── inventory/       # Inventory management
│   ├── projects/        # Project management
│   ├── equipment/       # Equipment tracking
│   ├── vendors/         # Vendor management
│   ├── procurement/     # Purchase orders & invoices
│   └── worker/          # Worker-specific mobile screens
├── hooks/               # Custom React hooks for business logic
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client & types
└── lib/                 # Utility functions
```

### Authentication & Authorization

The app uses **Clerk** for authentication with a custom role-based permission system:

- **Roles**: `super_admin`, `project_manager`, `worker`
- **Role Guards**: Use `RoleGuard`, `AdminOnlyGuard`, `AdminManagerGuard`, `WorkerGuard`
- **Authentication Wrapper**: `ClerkAuthGuard` wraps the entire app

### Data Layer

- **Database**: Supabase PostgreSQL with typed client
- **Business Logic**: Supabase Edge Functions handle complex operations
- **Types**: Auto-generated TypeScript types in `src/integrations/supabase/types.ts`
- **Query Management**: TanStack Query for caching, background updates, and optimistic updates
- **Audit Trail**: All table changes tracked via `audit_logs` table
- **Row Level Security**: Enabled with role-based policies

### Database Schema Overview

The application uses a comprehensive PostgreSQL schema with the following core entities:

#### **Inventory Management**
- `products` - Product catalog with SKUs, stock levels, and MAUC (Moving Average Unit Cost)
- `product_categories` - Hierarchical product categorization
- `inventory_locations` - Physical storage locations and warehouses
- `stock_transactions` - All inventory movements (in/out/transfer/adjustment)

#### **Project Management**
- `projects` - Construction projects with budgets, timelines, and status tracking
- `project_assignments` - User assignments to projects
- `customers` - Client information with contact details
- `expenses` - Project-related expenses with approval workflow

#### **Procurement**
- `vendors` - Supplier information with contact and credit details
- `purchase_orders` - PO management with multi-status workflow
- `purchase_order_items` - Line items linking products to POs
- `vendor_invoices` - Invoice processing and payment tracking

#### **Equipment & Assets**
- `equipment` - Asset tracking with status, location, and checkout system
- `equipment_maintenance` - Scheduled and reactive maintenance records

#### **Requisition System**
- `requisitions` - Material requests tied to projects with approval workflow
- `requisition_items` - Individual items requested with quantities

#### **Customer Billing**
- `customer_invoices` - Project billing with payment tracking
- `customer_invoice_items` - Billable line items

#### **System Management**
- `user_profiles` - User management with roles (`super_admin`, `project_manager`, `worker`)
- `audit_logs` - Complete audit trail for all table modifications

### Business Workflow Patterns

#### **Inventory Flow**
1. Products created with min/max stock levels and location assignment
2. Stock transactions automatically update `current_stock` via triggers
3. MAUC (Moving Average Unit Cost) calculated on each stock-in transaction
4. Low stock alerts generated when `current_stock < min_stock_level`

#### **Requisition Workflow**
1. Workers create requisitions tied to projects
2. Approval workflow: `pending` → `approved`/`rejected` → `fulfilled`
3. Approved requisitions generate stock transactions
4. Priority levels: `low`, `normal`, `high`, `urgent`

#### **Purchase Order Process**
1. POs created with vendor and line items
2. Status progression: `draft` → `sent` → `acknowledged` → `received` → `closed`
3. Receiving updates `received_quantity` on PO items
4. Creates corresponding stock transactions for received items

#### **Equipment Management**
1. Equipment status: `available`, `checked_out`, `maintenance`, `retired`
2. Checkout system tracks who has equipment and when
3. Maintenance scheduling with status tracking
4. Cost tracking for purchase and current value

#### **Project Costing**
1. Stock transactions linked to projects for material costing
2. Equipment assignments tracked per project
3. Expenses with approval workflow for project costs
4. Customer invoicing tied to project deliverables

### Database Constraints & Business Rules

#### **Critical Constraints**
- `products.current_stock` must be ≥ 0 (CHECK constraint)
- All numeric IDs use UUIDs for better distributed system support
- Foreign key constraints enforce referential integrity across all relationships
- `audit_logs` records all INSERT/UPDATE/DELETE operations automatically

#### **Status Enums**
- **Equipment**: `available`, `checked_out`, `maintenance`, `retired`
- **Purchase Orders**: `draft`, `sent`, `acknowledged`, `received`, `closed`, `cancelled`
- **Requisitions**: `pending`, `approved`, `rejected`, `fulfilled`
- **Projects**: Uses custom `project_status` enum (planning, active, on_hold, completed, cancelled)
- **User Roles**: `super_admin`, `project_manager`, `worker`
- **Stock Transactions**: Custom `transaction_type` enum (in, out, transfer, adjustment)

#### **Calculated Fields**
- `purchase_order_items.total_price` = quantity × unit_price
- `customer_invoice_items.total_price` = quantity × unit_price  
- `customer_invoices.tax_amount` = (subtotal × tax_rate) / 100
- `customer_invoices.total_amount` = subtotal + tax_amount

#### **Unique Constraints**
- Product SKUs must be unique across the system
- Equipment numbers must be unique
- PO numbers, requisition numbers, invoice numbers are unique
- Customer and vendor numbers are unique integers

### Custom Hooks Pattern

Business logic is encapsulated in custom hooks:
- `useBusinessLogic()` - Calls Supabase edge functions
- `useProducts()` - Product/inventory operations
- `useProjects()` - Project management
- `useEquipment()` - Equipment tracking
- `useUserProfile()` - User authentication & roles

### Design System

- **Fonts**: Montserrat (headings), Inter (body text)
- **Color Scheme**: Custom B&B Concrete branding with status colors
- **Components**: Consistent shadcn/ui components with custom styling
- **Responsive**: Mobile-first design with worker-optimized screens

## Development Patterns

### Adding New Features

1. **Database Schema**: Add tables/columns via Supabase migrations
2. **Types**: Regenerate types: `supabase gen types typescript --project-id=xyvnqtjxnlongywzhhnd > src/integrations/supabase/types.ts`
3. **Business Logic**: Add edge function for complex operations
4. **Hooks**: Create custom hook for data operations
5. **Components**: Build UI components following existing patterns
6. **Pages**: Add route components and update `App.tsx`
7. **Guards**: Apply appropriate role guards for access control

### File Naming Conventions

- **Components**: PascalCase (`ProductCard.tsx`)
- **Pages**: PascalCase (`InventoryOverview.tsx`)
- **Hooks**: camelCase with "use" prefix (`useProducts.tsx`)
- **Utilities**: camelCase (`utils.ts`)

### Component Structure

Follow this pattern for new components:
```tsx
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ComponentProps {
  // Props definition
}

export const Component: FC<ComponentProps> = ({ 
  // Destructured props 
}) => {
  // Component logic
  
  return (
    // JSX with consistent styling
  );
};
```

### API Integration

- Use custom hooks that wrap TanStack Query
- Call Supabase edge functions for business logic via `useBusinessLogic()`
- Handle loading states, errors, and optimistic updates
- Implement proper TypeScript typing from generated Supabase types

### Role-Based Access

Always wrap protected content with appropriate guards:
```tsx
<AdminOnlyGuard showError>
  <SuperAdminOnlyContent />
</AdminOnlyGuard>
```

### Mobile Optimization

- Worker screens are optimized for mobile use
- Use responsive Tailwind classes
- Test on mobile devices for touch interactions
- Consider barcode scanning workflows

## Environment Setup

### Required Environment Variables
```env
VITE_SUPABASE_PROJECT_ID=xyvnqtjxnlongywzhhnd
VITE_SUPABASE_PUBLISHABLE_KEY=[key]
VITE_SUPABASE_URL=https://xyvnqtjxnlongywzhhnd.supabase.co
```

### Supabase Configuration
- **Auth Provider**: Clerk integration configured
- **Edge Functions**: Business logic, notifications, inventory operations
- **RLS**: Row-level security enabled with role-based policies
- **Sample Data**: Available in `sample-data.sql`

### Common Database Operations

#### **Type Generation**
```bash
# Regenerate TypeScript types after schema changes
supabase gen types typescript --project-id=xyvnqtjxnlongywzhhnd > src/integrations/supabase/types.ts
```

#### **Sample Data Loading**
```bash
# Load sample data for testing
supabase db reset
psql -h localhost -p 54322 -d postgres -U postgres -f sample-data.sql
```

#### **Edge Functions**
The following edge functions handle complex business logic:
- `business-logic` - Stock alerts, number generation, bulk operations
- `notification-handler` - System notifications and alerts
- `inventory-operations` - Complex inventory movements
- `approval-workflow` - Requisition and expense approvals
- `report-generator` - Advanced reporting and analytics

## Key Dependencies

- `@clerk/clerk-react` - Authentication
- `@supabase/supabase-js` - Database client
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Accessible UI primitives
- `react-hook-form` + `zod` - Form handling & validation
- `lucide-react` - Icon library
- `recharts` - Data visualization
- `react-dropzone` - File uploads
- `xlsx` - Excel file processing

## Testing & Quality

- **ESLint**: Configured with React and TypeScript rules
- **TypeScript**: Strict mode enabled
- **Components**: All UI components from shadcn/ui with consistent APIs
- **Error Handling**: Toast notifications for user feedback
- **Performance**: Query caching, lazy loading, optimistic updates

## Deployment

This is a Lovable.dev project that auto-deploys on push to main branch. Local development connects to shared Supabase instance for consistency.
