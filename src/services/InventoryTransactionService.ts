import { createServerClient } from '@/lib/supabase-server'
import { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

// Type definitions
export type TransactionType = Database['public']['Tables']['inventory_transactions']['Row']['transaction_type']
export type TransactionStatus = Database['public']['Tables']['inventory_transactions']['Row']['status']
export type InventoryTransaction = Database['public']['Tables']['inventory_transactions']['Row']
export type InventoryTransactionInsert = Database['public']['Tables']['inventory_transactions']['Insert']

export interface CreateTransactionInput {
  // Required fields
  transaction_type: TransactionType
  product_id: string
  quantity: number
  transaction_done_by: string
  
  // User information
  transaction_done_by_id?: string
  transaction_done_by_email?: string
  
  // Optional transaction details
  reference_number?: string
  unit_cost?: number
  notes?: string
  reason?: string
  
  // Location information
  from_location_id?: string
  from_location_name?: string
  to_location_id?: string
  to_location_name?: string
  
  // Project information
  project_id?: string
  project_name?: string
  
  // Batch/Serial tracking
  batch_number?: string
  serial_numbers?: string[]
  expiry_date?: string
  
  // Approval workflow
  approval_required?: boolean
  approved_by?: string
  approved_by_id?: string
  
  // Additional metadata
  attachments?: any
  external_system_id?: string
  external_system_name?: string
}

export interface TransactionResult {
  success: boolean
  transaction?: InventoryTransaction
  error?: string
  stock_updated?: boolean
  new_stock_level?: number
}

export class InventoryTransactionService {
  private supabase: SupabaseClient<Database>

  constructor(supabaseClient?: SupabaseClient<Database>) {
    this.supabase = supabaseClient || createServerClient()
  }

  /**
   * Create a new inventory transaction and automatically update stock levels
   */
  async createTransaction(input: CreateTransactionInput): Promise<TransactionResult> {
    try {
      // Start a database transaction to ensure atomicity
      const { data: result, error } = await this.supabase.rpc('create_inventory_transaction_with_stock_update', {
        p_transaction_input: input
      })

      if (error) {
        // If RPC doesn't exist, fall back to manual transaction
        return await this.createTransactionManual(input)
      }

      return {
        success: true,
        transaction: result?.transaction,
        stock_updated: true,
        new_stock_level: result?.new_stock_level
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create transaction'
      }
    }
  }

  /**
   * Manual transaction creation with stock update (fallback method)
   */
  private async createTransactionManual(input: CreateTransactionInput): Promise<TransactionResult> {
    try {
      // Get current product stock
      const { data: product, error: productError } = await this.supabase
        .from('products')
        .select('id, current_stock, name, sku')
        .eq('id', input.product_id)
        .single()

      if (productError || !product) {
        return {
          success: false,
          error: `Product not found: ${productError?.message || 'Unknown product'}`
        }
      }

      const currentStock = product.current_stock || 0
      
      // Calculate new stock level based on transaction type
      let newStockLevel = currentStock
      switch (input.transaction_type) {
        case 'IN':
          newStockLevel = currentStock + input.quantity
          break
        case 'OUT':
          newStockLevel = currentStock - input.quantity
          if (newStockLevel < 0) {
            return {
              success: false,
              error: `Insufficient stock. Available: ${currentStock}, Requested: ${input.quantity}`
            }
          }
          break
        case 'RETURN':
          newStockLevel = currentStock + input.quantity
          break
        case 'ADJUSTMENT':
          // For adjustments, quantity can be positive or negative
          newStockLevel = currentStock + input.quantity
          break
        case 'TRANSFER':
          // For transfers, we don't change total stock, just location
          newStockLevel = currentStock
          break
        case 'DAMAGED':
        case 'EXPIRED':
          // Remove from stock
          newStockLevel = currentStock - Math.abs(input.quantity)
          break
        default:
          return {
            success: false,
            error: `Unsupported transaction type: ${input.transaction_type}`
          }
      }

      // Prepare transaction data
      const transactionData: InventoryTransactionInsert = {
        transaction_type: input.transaction_type,
        product_id: input.product_id,
        quantity: input.quantity,
        transaction_done_by: input.transaction_done_by,
        transaction_done_by_id: input.transaction_done_by_id,
        transaction_done_by_email: input.transaction_done_by_email,
        reference_number: input.reference_number,
        unit_cost: input.unit_cost,
        total_value: input.unit_cost ? input.quantity * input.unit_cost : null,
        from_location_id: input.from_location_id,
        from_location_name: input.from_location_name,
        to_location_id: input.to_location_id,
        to_location_name: input.to_location_name,
        project_id: input.project_id,
        project_name: input.project_name,
        stock_before: currentStock,
        stock_after: newStockLevel,
        batch_number: input.batch_number,
        serial_numbers: input.serial_numbers,
        expiry_date: input.expiry_date,
        notes: input.notes,
        reason: input.reason,
        approval_required: input.approval_required || false,
        approved_by: input.approved_by,
        approved_by_id: input.approved_by_id,
        approved_at: input.approved_by ? new Date().toISOString() : null,
        attachments: input.attachments,
        external_system_id: input.external_system_id,
        external_system_name: input.external_system_name,
        status: input.approval_required && !input.approved_by ? 'pending' : 'completed'
      }

      // Create the transaction record
      const { data: transaction, error: transactionError } = await this.supabase
        .from('inventory_transactions')
        .insert(transactionData)
        .select()
        .single()

      if (transactionError) {
        return {
          success: false,
          error: `Failed to create transaction: ${transactionError.message}`
        }
      }

      // Update product stock level (only if transaction is completed)
      if (transaction.status === 'completed' && input.transaction_type !== 'TRANSFER') {
        const { error: stockUpdateError } = await this.supabase
          .from('products')
          .update({ 
            current_stock: newStockLevel,
            updated_at: new Date().toISOString()
          })
          .eq('id', input.product_id)

        if (stockUpdateError) {
          // If stock update fails, we should ideally rollback the transaction
          // For now, we'll log the error but still return success
          console.error('Failed to update product stock:', stockUpdateError)
          return {
            success: true,
            transaction,
            stock_updated: false,
            error: 'Transaction created but stock update failed'
          }
        }
      }

      return {
        success: true,
        transaction,
        stock_updated: transaction.status === 'completed',
        new_stock_level: newStockLevel
      }

    } catch (error) {
      console.error('Error in manual transaction creation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create transaction'
      }
    }
  }

  /**
   * Get transaction history for a product
   */
  async getProductTransactionHistory(
    productId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<{ transactions: InventoryTransaction[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('inventory_transactions')
        .select(`
          *,
          product:products(name, sku, unit_of_measure),
          project:projects(name)
        `)
        .eq('product_id', productId)
        .order('transaction_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return { transactions: [], error: error.message }
      }

      return { transactions: data || [] }
    } catch (error) {
      return {
        transactions: [],
        error: error instanceof Error ? error.message : 'Failed to fetch transactions'
      }
    }
  }

  /**
   * Get recent transactions across all products
   */
  async getRecentTransactions(
    limit: number = 20,
    transactionTypes?: TransactionType[]
  ): Promise<{ transactions: any[]; error?: string }> {
    try {
      let query = this.supabase
        .from('inventory_transactions')
        .select(`
          *,
          product:products(name, sku, unit_of_measure),
          project:projects(name)
        `)
        .order('transaction_date', { ascending: false })
        .limit(limit)

      if (transactionTypes && transactionTypes.length > 0) {
        query = query.in('transaction_type', transactionTypes)
      }

      const { data, error } = await query

      if (error) {
        return { transactions: [], error: error.message }
      }

      return { transactions: data || [] }
    } catch (error) {
      return {
        transactions: [],
        error: error instanceof Error ? error.message : 'Failed to fetch transactions'
      }
    }
  }

  /**
   * Get transactions within a date range (inclusive)
   */
  async getTransactionsByDateRange(
    startISO: string,
    endISO: string,
    transactionTypes?: TransactionType[],
    limit: number = 100
  ): Promise<{ transactions: any[]; error?: string }> {
    try {
      let query = this.supabase
        .from('inventory_transactions')
        .select(`
          *,
          product:products(name, sku, unit_of_measure),
          project:projects(name)
        `)
        .gte('transaction_date', startISO)
        .lte('transaction_date', endISO)
        .order('transaction_date', { ascending: false })
        .limit(limit)

      if (transactionTypes && transactionTypes.length > 0) {
        query = query.in('transaction_type', transactionTypes)
      }

      const { data, error } = await query

      if (error) {
        return { transactions: [], error: error.message }
      }

      return { transactions: data || [] }
    } catch (error) {
      return {
        transactions: [],
        error: error instanceof Error ? error.message : 'Failed to fetch transactions by date range'
      }
    }
  }

  /**
   * Cancel/Reverse a transaction
   */
  async reverseTransaction(
    transactionId: string,
    reversedBy: string,
    reversedById?: string,
    reason?: string
  ): Promise<TransactionResult> {
    try {
      // Get the original transaction
      const { data: originalTransaction, error: fetchError } = await this.supabase
        .from('inventory_transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

      if (fetchError || !originalTransaction) {
        return {
          success: false,
          error: 'Transaction not found'
        }
      }

      if (originalTransaction.status === 'reversed') {
        return {
          success: false,
          error: 'Transaction already reversed'
        }
      }

      // Create a reverse transaction
      const reverseInput: CreateTransactionInput = {
        transaction_type: originalTransaction.transaction_type,
        product_id: originalTransaction.product_id,
        quantity: -originalTransaction.quantity, // Negative quantity to reverse
        transaction_done_by: reversedBy,
        transaction_done_by_id: reversedById,
        reference_number: `REV-${originalTransaction.transaction_number}`,
        notes: `Reversal of transaction ${originalTransaction.transaction_number}. Reason: ${reason || 'No reason provided'}`,
        reason: reason || 'Transaction reversal'
      }

      const reverseResult = await this.createTransaction(reverseInput)

      if (!reverseResult.success) {
        return reverseResult
      }

      // Mark the original transaction as reversed
      const { error: updateError } = await this.supabase
        .from('inventory_transactions')
        .update({
          status: 'reversed',
          reversed_by_transaction_id: reverseResult.transaction?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

      if (updateError) {
        return {
          success: false,
          error: 'Failed to mark original transaction as reversed'
        }
      }

      return {
        success: true,
        transaction: reverseResult.transaction,
        stock_updated: true,
        new_stock_level: reverseResult.new_stock_level
      }

    } catch (error) {
      console.error('Error reversing transaction:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reverse transaction'
      }
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(
    startDate?: string,
    endDate?: string,
    productId?: string
  ): Promise<{
    totalTransactions: number
    totalValue: number
    byType: Record<TransactionType, number>
    byStatus: Record<TransactionStatus, number>
    error?: string
  }> {
    try {
      let query = this.supabase
        .from('inventory_transactions')
        .select('transaction_type, status, total_value')

      if (startDate) {
        query = query.gte('transaction_date', startDate)
      }
      if (endDate) {
        query = query.lte('transaction_date', endDate)
      }
      if (productId) {
        query = query.eq('product_id', productId)
      }

      const { data, error } = await query

      if (error) {
        return {
          totalTransactions: 0,
          totalValue: 0,
          byType: {} as Record<TransactionType, number>,
          byStatus: {} as Record<TransactionStatus, number>,
          error: error.message
        }
      }

      const transactions = data || []
      const totalTransactions = transactions.length
      const totalValue = transactions.reduce((sum, t) => sum + (t.total_value || 0), 0)

      const byType = transactions.reduce((acc, t) => {
        acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1
        return acc
      }, {} as Record<TransactionType, number>)

      const byStatus = transactions.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1
        return acc
      }, {} as Record<TransactionStatus, number>)

      return {
        totalTransactions,
        totalValue,
        byType,
        byStatus
      }
    } catch (error) {
      return {
        totalTransactions: 0,
        totalValue: 0,
        byType: {} as Record<TransactionType, number>,
        byStatus: {} as Record<TransactionStatus, number>,
        error: error instanceof Error ? error.message : 'Failed to get transaction stats'
      }
    }
  }
}

// Export a default instance
export const inventoryTransactionService = new InventoryTransactionService()

// Export helper functions
export function getTransactionTypeDisplay(type: TransactionType): string {
  const displayMap: Record<TransactionType, string> = {
    'IN': 'Stock In',
    'OUT': 'Stock Out',
    'RETURN': 'Return',
    'ADJUSTMENT': 'Adjustment',
    'TRANSFER': 'Transfer',
    'DAMAGED': 'Damaged',
    'EXPIRED': 'Expired'
  }
  return displayMap[type] || type
}

export function getTransactionStatusColor(status: TransactionStatus): string {
  const colorMap: Record<TransactionStatus, string> = {
    'pending': 'yellow',
    'completed': 'green',
    'cancelled': 'gray',
    'reversed': 'red'
  }
  return colorMap[status] || 'gray'
}