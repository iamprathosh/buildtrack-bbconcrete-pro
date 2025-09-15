# Worker Operations Feature

## Overview
The Worker Operations feature provides a comprehensive inventory management system for workers and managers to handle stock transactions efficiently. This feature supports bulk operations and role-based access control.

## Features

### 🔐 Role-Based Access Control
- **Workers**: Can perform "Take Out" and "Return" operations
- **Managers/Super Admins**: Can perform all operations including "Stock In"

### 🎯 Three Main Operations

1. **Take Out (Pull)** 📦
   - Remove items from inventory for project use
   - Available to all users
   - Validates available stock before allowing transaction
   - Updates inventory automatically

2. **Stock In (Receive)** ➕
   - Add new stock received from vendors
   - **Manager/Admin only**
   - Increases inventory levels
   - Records receiving transactions

3. **Return** ↩️
   - Return unused items back to inventory
   - Available to all users
   - Adds items back to stock
   - Tracks return transactions

### 🏗️ Project-Based Transactions
- All operations require selecting a project
- Transactions are linked to specific projects for tracking
- Project selection dialog appears before starting any operation
- Shows active and planning projects only

### 🔍 Advanced Features

#### Multi-Select Interface
- Select multiple products for bulk operations
- Visual indicators for selected items
- "Select All" and "Clear" buttons for convenience

#### Smart Filtering
- Search by product name, SKU, or category
- Filter by product category
- Real-time filtering as you type

#### Stock Level Indicators
- **Good**: 25+ items (Green)
- **Low**: 10-24 items (Yellow)  
- **Critical**: <10 items (Red)
- Visual alerts for low stock items

#### Quantity Management
- Individual quantity input for each selected item
- Validation to prevent over-pulling from stock
- Real-time stock availability checking

### 🛡️ Data Integrity Features

#### Stock Validation
- Prevents pulling more than available stock
- Shows max available quantity for pull operations
- Real-time validation feedback

#### Transaction Logging
- All transactions recorded in `stock_transactions` table
- Includes user, project, timestamp, and notes
- Full audit trail for inventory movements

#### Error Handling
- Graceful error handling for failed transactions
- Success/error notifications for each operation
- Partial success reporting (some items succeed, others fail)

## Technical Implementation

### Database Schema
```sql
-- Stock transactions table
stock_transactions (
  id: uuid PRIMARY KEY,
  product_id: uuid FOREIGN KEY,
  project_id: uuid FOREIGN KEY,
  user_id: text,
  transaction_type: enum('pull', 'receive', 'return'),
  quantity: integer,
  unit_cost: numeric,
  notes: text,
  transaction_date: timestamptz,
  created_at: timestamptz
)
```

### API Integration
- Uses Supabase for real-time data synchronization
- TanStack Query for efficient caching and state management
- Optimistic updates for better user experience
- Automatic cache invalidation on successful transactions

### Role-Based UI
- `AdminManagerGuard` component controls access to Stock In feature
- Dynamic navigation based on user role
- Context-aware user interface elements

## Usage Guide

### For Workers
1. Navigate to "Operations" from the sidebar
2. Choose "Take Out" or "Return" operation
3. Select the project for the transaction
4. Browse or search for products
5. Select multiple items and enter quantities
6. Add optional notes
7. Execute the bulk operation

### For Managers
1. Same as workers, plus access to "Stock In" operation
2. Stock In allows receiving new inventory from vendors
3. Full access to all inventory management features

## Navigation Integration

The Worker Operations feature is integrated into the main application navigation:

- **Workers**: See "Operations" in sidebar (worker-specific inventory operations)
- **Managers**: See "Operations" + full inventory management access
- **Super Admins**: Complete access to all features

## Security Features

- Role-based access control at component level
- Server-side validation of user permissions
- Secure transaction recording with user attribution
- Audit trail for all inventory movements

## Performance Optimizations

- Efficient bulk operations (processes multiple items in single transaction)
- Real-time stock level updates
- Optimistic UI updates for better responsiveness
- Cached project and product data for faster loading

## Future Enhancements

- Barcode scanning integration for faster product selection
- Mobile-optimized interface for warehouse operations
- Advanced reporting and analytics
- Integration with equipment checkout system
- Automated low-stock alerts and reorder suggestions
