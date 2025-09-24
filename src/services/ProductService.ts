import { BaseService } from './BaseService'
import { 
  Product, 
  ProductInsert, 
  ProductUpdate,
  InventoryLocation,
  StockTransaction,
  StockTransactionInsert
} from '@/types/database'
import { DatabaseResult } from '@/lib/database-server'

export interface ProductWithDetails extends Omit<Product, 'location'> {
  location?: InventoryLocation | null
  inventory_location?: InventoryLocation | null
  stock_status?: 'in-stock' | 'low-stock' | 'out-of-stock'
  total_value?: number
}

export interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  categories: number
  avgItemValue: number
}

export class ProductService extends BaseService {
  
  // Get all products with categories and locations
  async getAllWithDetails(options?: {
    category?: string
    location?: string
    status?: string
    search?: string
    limit?: number
  }): Promise<DatabaseResult<ProductWithDetails[]>> {
    return this.safeQuery<ProductWithDetails[]>(async (client) => {
      let query = client
        .from('products')
        .select(`
          *,
          inventory_location:inventory_locations(*)
        `)

      // Apply filters
      if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category)
      }

      if (options?.location && options.location !== 'all') {
        query = query.eq('location_id', options.location)
      }

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%,description.ilike.%${options.search}%`)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      query = query.order('name')

      const result = await query
      
      if ((result as any).data) {
        // Calculate stock status and total value for each product
        const productsWithDetails: ProductWithDetails[] = (result as any).data.map((product: any) => {
          const currentStock = product.current_stock || 0
          const minLevel = product.min_stock_level || 0
          const mauc = product.mauc || 0
          
          let stock_status: 'in-stock' | 'low-stock' | 'out-of-stock'
          if (currentStock === 0) {
            stock_status = 'out-of-stock'
          } else if (currentStock <= minLevel) {
            stock_status = 'low-stock'
          } else {
            stock_status = 'in-stock'
          }

          return {
            ...product,
            stock_status,
            total_value: currentStock * mauc
          }
        })

        // Apply status filter after calculation
        let filteredProducts = productsWithDetails
        if (options?.status && options.status !== 'all') {
          filteredProducts = productsWithDetails.filter(p => p.stock_status === options.status)
        }

        return { ...result, data: filteredProducts }
      }

      return result
    })
  }

  // Get single product with details
  async getByIdWithDetails(id: string): Promise<DatabaseResult<ProductWithDetails>> {
    return this.safeQuery<ProductWithDetails>(async (client) => {
      const result = await client
        .from('products')
        .select(`
          *,
          inventory_location:inventory_locations(*)
        `)
        .eq('id', id)
        .single()

      if ((result as any).data) {
        const product: any = (result as any).data
        const currentStock = product.current_stock || 0
        const minLevel = product.min_stock_level || 0
        const mauc = product.mauc || 0
        
        let stock_status: 'in-stock' | 'low-stock' | 'out-of-stock'
        if (currentStock === 0) {
          stock_status = 'out-of-stock'
        } else if (currentStock <= minLevel) {
          stock_status = 'low-stock'
        } else {
          stock_status = 'in-stock'
        }

        const productWithDetails: ProductWithDetails = {
          ...product,
          stock_status,
          total_value: currentStock * mauc
        }

        return { ...result, data: productWithDetails }
      }

      return result
    })
  }

  // Create new product
  async createProduct(data: ProductInsert): Promise<DatabaseResult<Product>> {
    try {
      console.log('ProductService: Validating product data:', data)
      this.validateRequired(data, ['sku', 'name', 'unit_of_measure'])
      
      const productToInsert = {
        ...data,
        is_active: data.is_active ?? true,
        current_stock: data.current_stock ?? 0,
        created_at: this.formatDate(new Date()),
        updated_at: this.formatDate(new Date())
      }
      
      console.log('ProductService: Creating product with data:', productToInsert)
      
      const result = await this.create<Product>('products', productToInsert)
      
      if (result.error) {
        console.error('ProductService: Database error:', result.error)
      } else {
        console.log('ProductService: Product created successfully:', result.data)
      }
      
      return result
    } catch (error) {
      console.error('ProductService: Unexpected error in createProduct:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error in ProductService'
      }
    }
  }

  // Update product
  async updateProduct(id: string, data: ProductUpdate, updatedBy?: {name: string, id: string, email: string}): Promise<DatabaseResult<Product>> {
    return this.update<Product>('products', id, {
      ...data,
      updated_by: updatedBy?.name || null,
      updated_by_id: updatedBy?.id || null,
      updated_by_email: updatedBy?.email || null,
      updated_at: this.formatDate(new Date())
    })
  }

  // Delete product
  async deleteProduct(id: string): Promise<DatabaseResult<null>> {
    return this.delete('products', id)
  }

  // Get inventory statistics
  async getInventoryStats(): Promise<DatabaseResult<InventoryStats>> {
    return this.safeQuery<InventoryStats>(async (client) => {
      const productsResult = await client
        .from('products')
        .select('current_stock, min_stock_level, mauc, category')
        .eq('is_active', true)

      if (productsResult.error || !productsResult.data) {
        throw new Error('Failed to fetch products for stats')
      }

      const products = productsResult.data
      const totalItems = products.length
      let totalValue = 0
      let lowStockItems = 0
      let outOfStockItems = 0
      const uniqueCategories = new Set<string>()

      products.forEach((product: any) => {
        const stock = product.current_stock || 0
        const minLevel = product.min_stock_level || 0
        const mauc = product.mauc || 0

        totalValue += stock * mauc

        if (stock === 0) {
          outOfStockItems++
        } else if (stock <= minLevel) {
          lowStockItems++
        }

        if (product.category) {
          uniqueCategories.add(product.category)
        }
      })

      const stats: InventoryStats = {
        totalItems,
        totalValue,
        lowStockItems,
        outOfStockItems,
        categories: uniqueCategories.size,
        avgItemValue: totalItems > 0 ? totalValue / totalItems : 0
      }

      return { data: stats, error: null }
    })
  }

  // Get low stock items
  async getLowStockItems(): Promise<DatabaseResult<ProductWithDetails[]>> {
    return this.safeQuery<ProductWithDetails[]>(async (client) => {
      const result = await client
        .from('products')
        .select(`
          *,
          inventory_location:inventory_locations(*)
        `)
        .lte('current_stock', 0) // This will be refined by stock_status calculation
        .eq('is_active', true)
        .order('current_stock')

      if ((result as any).data) {
        const productsWithStatus = (result as any).data.map((product: any) => {
          const currentStock = product.current_stock || 0
          const minLevel = product.min_stock_level || 0
          const mauc = product.mauc || 0
          
          let stock_status: 'in-stock' | 'low-stock' | 'out-of-stock'
          if (currentStock === 0) {
            stock_status = 'out-of-stock'
          } else if (currentStock <= minLevel) {
            stock_status = 'low-stock'
          } else {
            stock_status = 'in-stock'
          }

          return {
            ...product,
            stock_status,
            total_value: currentStock * mauc
          }
        }).filter((product: any) => product.stock_status === 'low-stock' || product.stock_status === 'out-of-stock')

        return { ...result, data: productsWithStatus }
      }

      return result
    })
  }

  // Stock transaction methods
  async createStockTransaction(data: StockTransactionInsert): Promise<DatabaseResult<StockTransaction>> {
    this.validateRequired(data, ['product_id', 'user_id', 'transaction_type', 'quantity'])
    
    return this.safeQuery<StockTransaction>(async (client) => {
      // Create the transaction
      const transactionResult = await (client as any)
        .from('stock_transactions')
        .insert({
          ...data,
          transaction_date: data.transaction_date || this.formatDate(new Date()),
          created_at: this.formatDate(new Date())
        })
        .select()
        .single()

      if (transactionResult.error) {
        throw new Error(transactionResult.error.message)
      }

      // Update product stock based on transaction type
      const product = await client
        .from('products')
        .select('current_stock, mauc')
        .eq('id', data.product_id)
        .single()

      if ((product as any).data) {
        let newStock = (product as any).data.current_stock || 0
        let newMAUC = (product as any).data.mauc || 0

        switch (data.transaction_type) {
          case 'receive':
            newStock += data.quantity
            // Calculate new MAUC if unit cost provided
            if (data.unit_cost && newStock > 0) {
              const totalValue = ((product as any).data.current_stock || 0) * ((product as any).data.mauc || 0) + 
                               data.quantity * data.unit_cost
              newMAUC = totalValue / newStock
            }
            break
          case 'pull':
            newStock = Math.max(0, newStock - data.quantity)
            break
          case 'return':
            newStock += data.quantity
            break
        }

        // Update the product
        await (client as any)
          .from('products')
          .update({ 
            current_stock: newStock,
            mauc: newMAUC,
            updated_at: this.formatDate(new Date())
          })
          .eq('id', data.product_id)
      }

      return transactionResult
    })
  }

  // Get stock transactions for a product
  async getStockTransactions(productId: string, limit = 50): Promise<DatabaseResult<StockTransaction[]>> {
    return this.safeQuery<StockTransaction[]>(async (client) => 
      client
        .from('stock_transactions')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit)
    )
  }

  // Search products
  async searchProducts(searchTerm: string, limit = 50): Promise<DatabaseResult<ProductWithDetails[]>> {
    const result = await this.search<Product>('products', ['name', 'sku', 'description'], searchTerm, limit)
    
    if ((result as any).data) {
      // Add stock status to search results
      const productsWithDetails: ProductWithDetails[] = (result as any).data.map((product: any) => {
        const currentStock = product.current_stock || 0
        const minLevel = product.min_stock_level || 0
        const mauc = product.mauc || 0
        
        let stock_status: 'in-stock' | 'low-stock' | 'out-of-stock'
        if (currentStock === 0) {
          stock_status = 'out-of-stock'
        } else if (currentStock <= minLevel) {
          stock_status = 'low-stock'
        } else {
          stock_status = 'in-stock'
        }

        return {
          ...product,
          stock_status,
          total_value: currentStock * mauc
        }
      })

      return { data: productsWithDetails, error: null }
    }

    return result as DatabaseResult<ProductWithDetails[]>
  }
}

// Export singleton instance
export const productService = new ProductService()