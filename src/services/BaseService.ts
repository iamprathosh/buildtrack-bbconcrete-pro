import { SupabaseClient } from '@supabase/supabase-js'
import { Database, DatabaseResult } from '@/types/database'
import { supabase, dbUtils } from '@/lib/database'

// Base service class for consistent database operations
export abstract class BaseService {
  protected client: SupabaseClient<Database>

  constructor() {
    this.client = supabase
  }

  // Safe query execution with error handling
  protected async safeQuery<T>(
    queryFn: (client: SupabaseClient<Database>) => Promise<any>
  ): Promise<DatabaseResult<T>> {
    return dbUtils.safeQuery<T>(queryFn)
  }

  // Get all records from a table
  protected async getAll<T>(tableName: string, orderBy?: string): Promise<DatabaseResult<T[]>> {
    return this.safeQuery<T[]>(async (client) => {
      let query = client.from(tableName).select('*')
      
      if (orderBy) {
        query = query.order(orderBy)
      }
      
      return query
    })
  }

  // Get record by ID
  protected async getById<T>(tableName: string, id: string): Promise<DatabaseResult<T>> {
    return this.safeQuery<T>(async (client) => 
      client.from(tableName).select('*').eq('id', id).single()
    )
  }

  // Create new record
  protected async create<T>(tableName: string, data: any): Promise<DatabaseResult<T>> {
    return this.safeQuery<T>(async (client) => {
      return (client as any).from(tableName).insert(data).select().single()
    })
  }

  // Update existing record
  protected async update<T>(tableName: string, id: string, data: any): Promise<DatabaseResult<T>> {
    return this.safeQuery<T>(async (client) => {
      return (client as any).from(tableName).update(data).eq('id', id).select().single()
    })
  }

  // Delete record
  protected async delete(tableName: string, id: string): Promise<DatabaseResult<null>> {
    return this.safeQuery<null>(async (client) => 
      client.from(tableName).delete().eq('id', id)
    )
  }

  // Count records
  protected async count(tableName: string, filters?: Record<string, any>): Promise<DatabaseResult<number>> {
    return this.safeQuery<number>(async (client) => {
      let query = client.from(tableName).select('*', { count: 'exact', head: true })
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      return query.then(result => ({ ...result, data: result.count || 0 }))
    })
  }

  // Search records with text
  protected async search<T>(
    tableName: string, 
    searchFields: string[], 
    searchTerm: string,
    limit = 50
  ): Promise<DatabaseResult<T[]>> {
    return this.safeQuery<T[]>(async (client) => {
      if (!searchTerm.trim()) {
        return client.from(tableName).select('*').limit(limit)
      }

      const searchCondition = searchFields
        .map(field => `${field}.ilike.%${searchTerm}%`)
        .join(',')
      
      return client
        .from(tableName)
        .select('*')
        .or(searchCondition)
        .limit(limit)
    })
  }

  // Batch operations
  protected async createMany<T>(tableName: string, data: any[]): Promise<DatabaseResult<T[]>> {
    return this.safeQuery<T[]>(async (client) => {
      return (client as any).from(tableName).insert(data).select()
    })
  }

  // Validate required fields before database operations
  protected validateRequired(data: Record<string, any>, requiredFields: string[]): void {
    dbUtils.validateRequired(data, requiredFields)
  }

  // Format date for database storage
  protected formatDate(date: Date | string | null): string | null {
    return dbUtils.formatDate(date)
  }
}