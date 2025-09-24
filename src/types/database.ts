export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          manager_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_assignments: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'project_manager' | 'supervisor' | 'worker' | 'consultant'
          status: 'active' | 'pending' | 'completed' | 'removed'
          assigned_at: string
          assigned_by: string | null
          start_date: string | null
          end_date: string | null
          hours_allocated: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: 'project_manager' | 'supervisor' | 'worker' | 'consultant'
          status?: 'active' | 'pending' | 'completed' | 'removed'
          assigned_at?: string
          assigned_by?: string | null
          start_date?: string | null
          end_date?: string | null
          hours_allocated?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'project_manager' | 'supervisor' | 'worker' | 'consultant'
          status?: 'active' | 'pending' | 'completed' | 'removed'
          assigned_at?: string
          assigned_by?: string | null
          start_date?: string | null
          end_date?: string | null
          hours_allocated?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          phone_extension: string | null
          emergency_contact: string | null
          department_id: string | null
          position: string | null
          reports_to_id: string | null
          hire_date: string | null
          role: 'super_admin' | 'project_manager' | 'worker'
          is_active: boolean
          last_login: string | null
          preferences: Json
          permissions: Json
          created_at: string
          updated_at: string
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'super_admin' | 'project_manager' | 'worker'
          is_active: boolean
          last_login: string | null
          preferences: Json
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          phone_extension?: string | null
          emergency_contact?: string | null
          department_id?: string | null
          position?: string | null
          reports_to_id?: string | null
          hire_date?: string | null
          role?: 'super_admin' | 'project_manager' | 'worker'
          is_active?: boolean
          last_login?: string | null
          preferences?: Json
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          phone_extension?: string | null
          emergency_contact?: string | null
          department_id?: string | null
          position?: string | null
          reports_to_id?: string | null
          hire_date?: string | null
          role?: 'super_admin' | 'project_manager' | 'worker'
          is_active?: boolean
          last_login?: string | null
          preferences?: Json
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          customer_number: number
          name: string
          sort_name: string | null
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          contact: string | null
          phone: string | null
          fax: string | null
          email: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          customer_number: number
          name: string
          sort_name?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          contact?: string | null
          phone?: string | null
          fax?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          customer_number?: number
          name?: string
          sort_name?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          contact?: string | null
          phone?: string | null
          fax?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          job_number: string
          name: string
          description: string | null
          budget: number | null
          location: string | null
          customer_id: string | null
          project_manager_id: string | null
          start_date: string | null
          end_date: string | null
          status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          job_number: string
          name: string
          description?: string | null
          budget?: number | null
          location?: string | null
          customer_id?: string | null
          project_manager_id?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          job_number?: string
          name?: string
          description?: string | null
          budget?: number | null
          location?: string | null
          customer_id?: string | null
          project_manager_id?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      vendors: {
        Row: {
          id: string
          vendor_number: number
          name: string
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          phone: string | null
          email: string | null
          contact_name: string | null
          credit_limit: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          vendor_number: number
          name: string
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          contact_name?: string | null
          credit_limit?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          vendor_number?: number
          name?: string
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          contact_name?: string | null
          credit_limit?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          category: string | null
          unit_of_measure: string
          current_stock: number | null
          min_stock_level: number | null
          max_stock_level: number | null
          mauc: number | null
          location: string | null
          location_id: string | null
          supplier: string | null
          image_url: string | null
          is_active: boolean | null
          created_by: string | null
          created_by_id: string | null
          created_by_email: string | null
          updated_by: string | null
          updated_by_id: string | null
          updated_by_email: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description?: string | null
          category?: string | null
          unit_of_measure: string
          current_stock?: number | null
          min_stock_level?: number | null
          max_stock_level?: number | null
          mauc?: number | null
          location?: string | null
          location_id?: string | null
          supplier?: string | null
          image_url?: string | null
          is_active?: boolean | null
          created_by?: string | null
          created_by_id?: string | null
          created_by_email?: string | null
          updated_by?: string | null
          updated_by_id?: string | null
          updated_by_email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          description?: string | null
          category?: string | null
          unit_of_measure?: string
          current_stock?: number | null
          min_stock_level?: number | null
          max_stock_level?: number | null
          mauc?: number | null
          location?: string | null
          location_id?: string | null
          supplier?: string | null
          image_url?: string | null
          is_active?: boolean | null
          created_by?: string | null
          created_by_id?: string | null
          created_by_email?: string | null
          updated_by?: string | null
          updated_by_id?: string | null
          updated_by_email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      inventory_locations: {
        Row: {
          id: string
          name: string
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      stock_transactions: {
        Row: {
          id: string
          product_id: string
          project_id: string | null
          user_id: string
          transaction_type: 'pull' | 'receive' | 'return'
          quantity: number
          unit_cost: number | null
          transaction_date: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          project_id?: string | null
          user_id: string
          transaction_type: 'pull' | 'receive' | 'return'
          quantity: number
          unit_cost?: number | null
          transaction_date?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          project_id?: string | null
          user_id?: string
          transaction_type?: 'pull' | 'receive' | 'return'
          quantity?: number
          unit_cost?: number | null
          transaction_date?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          transaction_type: 'IN' | 'OUT' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'DAMAGED' | 'EXPIRED'
          transaction_number: string | null
          reference_number: string | null
          product_id: string
          quantity: number
          unit_cost: number | null
          total_value: number | null
          from_location_id: string | null
          from_location_name: string | null
          to_location_id: string | null
          to_location_name: string | null
          project_id: string | null
          project_name: string | null
          transaction_done_by: string
          transaction_done_by_id: string | null
          transaction_done_by_email: string | null
          approved_by: string | null
          approved_by_id: string | null
          approved_at: string | null
          approval_required: boolean | null
          stock_before: number | null
          stock_after: number | null
          batch_number: string | null
          serial_numbers: string[] | null
          expiry_date: string | null
          notes: string | null
          reason: string | null
          attachments: any | null
          transaction_date: string
          created_at: string
          updated_at: string
          status: 'pending' | 'completed' | 'cancelled' | 'reversed'
          reversed_by_transaction_id: string | null
          external_system_id: string | null
          external_system_name: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          transaction_type: 'IN' | 'OUT' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'DAMAGED' | 'EXPIRED'
          transaction_number?: string | null
          reference_number?: string | null
          product_id: string
          quantity: number
          unit_cost?: number | null
          total_value?: number | null
          from_location_id?: string | null
          from_location_name?: string | null
          to_location_id?: string | null
          to_location_name?: string | null
          project_id?: string | null
          project_name?: string | null
          transaction_done_by: string
          transaction_done_by_id?: string | null
          transaction_done_by_email?: string | null
          approved_by?: string | null
          approved_by_id?: string | null
          approved_at?: string | null
          approval_required?: boolean | null
          stock_before?: number | null
          stock_after?: number | null
          batch_number?: string | null
          serial_numbers?: string[] | null
          expiry_date?: string | null
          notes?: string | null
          reason?: string | null
          attachments?: any | null
          transaction_date?: string
          created_at?: string
          updated_at?: string
          status?: 'pending' | 'completed' | 'cancelled' | 'reversed'
          reversed_by_transaction_id?: string | null
          external_system_id?: string | null
          external_system_name?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          transaction_type?: 'IN' | 'OUT' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'DAMAGED' | 'EXPIRED'
          transaction_number?: string | null
          reference_number?: string | null
          product_id?: string
          quantity?: number
          unit_cost?: number | null
          total_value?: number | null
          from_location_id?: string | null
          from_location_name?: string | null
          to_location_id?: string | null
          to_location_name?: string | null
          project_id?: string | null
          project_name?: string | null
          transaction_done_by?: string
          transaction_done_by_id?: string | null
          transaction_done_by_email?: string | null
          approved_by?: string | null
          approved_by_id?: string | null
          approved_at?: string | null
          approval_required?: boolean | null
          stock_before?: number | null
          stock_after?: number | null
          batch_number?: string | null
          serial_numbers?: string[] | null
          expiry_date?: string | null
          notes?: string | null
          reason?: string | null
          attachments?: any | null
          transaction_date?: string
          created_at?: string
          updated_at?: string
          status?: 'pending' | 'completed' | 'cancelled' | 'reversed'
          reversed_by_transaction_id?: string | null
          external_system_id?: string | null
          external_system_name?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          equipment_number: string
          category: string | null
          model: string | null
          serial_number: string | null
          purchase_date: string | null
          purchase_cost: number | null
          current_value: number | null
          status: 'available' | 'checked_out' | 'maintenance' | 'retired'
          location: string | null
          checked_out_to: string | null
          checked_out_date: string | null
          notes: string | null
          image_url: string | null
          maintenance_expected_return_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          equipment_number: string
          category?: string | null
          model?: string | null
          serial_number?: string | null
          purchase_date?: string | null
          purchase_cost?: number | null
          current_value?: number | null
          status?: 'available' | 'checked_out' | 'maintenance' | 'retired'
          location?: string | null
          checked_out_to?: string | null
          checked_out_date?: string | null
          notes?: string | null
          image_url?: string | null
          maintenance_expected_return_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          equipment_number?: string
          category?: string | null
          model?: string | null
          serial_number?: string | null
          purchase_date?: string | null
          purchase_cost?: number | null
          current_value?: number | null
          status?: 'available' | 'checked_out' | 'maintenance' | 'retired'
          location?: string | null
          checked_out_to?: string | null
          checked_out_date?: string | null
          notes?: string | null
          image_url?: string | null
          maintenance_expected_return_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_tasks: {
        Row: {
          id: string
          project_id: string
          task_number: number
          name: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to: string | null
          start_date: string | null
          due_date: string | null
          completed_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          dependencies: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          task_number?: number
          name: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string | null
          start_date?: string | null
          due_date?: string | null
          completed_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          dependencies?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          task_number?: number
          name?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string | null
          start_date?: string | null
          due_date?: string | null
          completed_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          dependencies?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
      user_role: 'super_admin' | 'project_manager' | 'worker'
      transaction_type: 'pull' | 'receive' | 'return'
      task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      task_priority: 'low' | 'medium' | 'high' | 'urgent'
    }
  }
}

// Utility types for easier use
export type Department = Database['public']['Tables']['departments']['Row']
export type ProjectAssignment = Database['public']['Tables']['project_assignments']['Row']

// Insert types for forms
export type DepartmentInsert = Database['public']['Tables']['departments']['Insert']
export type ProjectAssignmentInsert = Database['public']['Tables']['project_assignments']['Insert']

// Update types for forms
export type DepartmentUpdate = Database['public']['Tables']['departments']['Update']
export type ProjectAssignmentUpdate = Database['public']['Tables']['project_assignments']['Update']

// Assignment role type
export type ProjectAssignmentRole = ProjectAssignment['role']
export type ProjectAssignmentStatus = ProjectAssignment['status']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Vendor = Database['public']['Tables']['vendors']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type InventoryLocation = Database['public']['Tables']['inventory_locations']['Row']
export type StockTransaction = Database['public']['Tables']['stock_transactions']['Row']
export type Equipment = Database['public']['Tables']['equipment']['Row']
export type ProjectTask = Database['public']['Tables']['project_tasks']['Row']

// Insert types for forms
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type VendorInsert = Database['public']['Tables']['vendors']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type InventoryLocationInsert = Database['public']['Tables']['inventory_locations']['Insert']
export type StockTransactionInsert = Database['public']['Tables']['stock_transactions']['Insert']
export type EquipmentInsert = Database['public']['Tables']['equipment']['Insert']
export type ProjectTaskInsert = Database['public']['Tables']['project_tasks']['Insert']

// Update types for forms
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type VendorUpdate = Database['public']['Tables']['vendors']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type InventoryLocationUpdate = Database['public']['Tables']['inventory_locations']['Update']
export type StockTransactionUpdate = Database['public']['Tables']['stock_transactions']['Update']
export type EquipmentUpdate = Database['public']['Tables']['equipment']['Update']
export type ProjectTaskUpdate = Database['public']['Tables']['project_tasks']['Update']

// Enum types
export type ProjectStatus = Database['public']['Enums']['project_status']
export type UserRole = Database['public']['Enums']['user_role']
export type TransactionType = Database['public']['Enums']['transaction_type']
export type EquipmentStatus = 'available' | 'checked_out' | 'maintenance' | 'retired'
export type TaskStatus = Database['public']['Enums']['task_status']
export type TaskPriority = Database['public']['Enums']['task_priority']

// Database operation result type
export interface DatabaseResult<T> {
  data: T | null
  error: string | null
}
