import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { inventoryTransactionService, type CreateTransactionInput, type TransactionType } from '@/services/InventoryTransactionService'

export async function GET(request: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const typeFilter = searchParams.get('type')
    const todayParam = searchParams.get('today')
    const dateParam = searchParams.get('date') // YYYY-MM-DD
    
    // Map old transaction types to new ones
    const typeMapping: Record<string, TransactionType> = {
      'pull': 'OUT',
      'receive': 'IN', 
      'return': 'RETURN'
    }
    
    const transactionTypes = typeFilter && typeFilter !== 'all' 
      ? [typeMapping[typeFilter] || typeFilter as TransactionType]
      : undefined

    let transactions: any[] = []
    let error: string | undefined

    // If today or specific date requested, filter on server
    if ((todayParam && (todayParam === '1' || todayParam.toLowerCase() === 'true')) || dateParam) {
      let start = new Date()
      if (dateParam) {
        const [y, m, d] = dateParam.split('-').map((v) => parseInt(v, 10))
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          start = new Date(y, (m - 1), d)
        }
      }
      const startOfDay = new Date(start)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(start)
      endOfDay.setHours(23, 59, 59, 999)

      const res = await inventoryTransactionService.getTransactionsByDateRange(
        startOfDay.toISOString(),
        endOfDay.toISOString(),
        transactionTypes,
        limit
      )
      transactions = res.transactions
      error = res.error
    } else {
      const res = await inventoryTransactionService.getRecentTransactions(
        limit,
        transactionTypes
      )
      transactions = res.transactions
      error = res.error
    }

    if (error) {
      console.error('Failed to fetch transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    // Transform the data to match the frontend interface
    const transformedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.transaction_type,
      product: transaction.product?.name || 'Unknown Product',
      sku: transaction.product?.sku || 'N/A',
      quantity: transaction.quantity,
      unit: transaction.product?.unit_of_measure || 'units',
      project: transaction.project?.name || transaction.project_name || 'No Project',
      user: transaction.transaction_done_by || 'Unknown User',
      timestamp: transaction.transaction_date,
      status: transaction.status,
      notes: transaction.notes,
      unit_cost: transaction.unit_cost,
      transaction_number: transaction.transaction_number,
      reference_number: transaction.reference_number,
      stock_before: transaction.stock_before,
      stock_after: transaction.stock_after
    }))

    return NextResponse.json({ transactions: transformedTransactions })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      product_id,
      project_id,
      quantity,
      transaction_type,
      unit_cost,
      notes,
      reference_number,
      location,
      from_location,
      to_location,
      batch_number,
      expiry_date,
      transaction_done_by,
      transaction_done_by_id,
      transaction_done_by_email,
      // Legacy field names for backward compatibility
      productId,
      projectId,
      transactionType,
      unitCost,
      referenceNumber,
      fromLocation,
      toLocation,
      batchNumber,
      expiryDate
    } = body

    // Map old transaction types to new ones
    const typeMapping: Record<string, TransactionType> = {
      'pull': 'OUT',
      'receive': 'IN', 
      'return': 'RETURN'
    }

    // Use new field names, fall back to legacy ones
    const finalTransactionType = transaction_type || transactionType
    const finalProductId = product_id || productId
    const finalProjectId = project_id || projectId
    const finalUnitCost = unit_cost || unitCost
    const finalReferenceNumber = reference_number || referenceNumber
    const finalFromLocation = from_location || fromLocation || location
    const finalToLocation = to_location || toLocation
    const finalBatchNumber = batch_number || batchNumber
    const finalExpiryDate = expiry_date || expiryDate

    const mappedTransactionType = typeMapping[finalTransactionType] || finalTransactionType as TransactionType

    // Create transaction input
    const transactionInput: CreateTransactionInput = {
      transaction_type: mappedTransactionType,
      product_id: finalProductId,
      quantity: Number(quantity),
      transaction_done_by: transaction_done_by || user.fullName || user.firstName || 'Unknown User',
      transaction_done_by_id: transaction_done_by_id || user.id,
      transaction_done_by_email: transaction_done_by_email || user.emailAddresses[0]?.emailAddress,
      project_id: finalProjectId || undefined,
      unit_cost: finalUnitCost ? Number(finalUnitCost) : undefined,
      notes: notes || undefined,
      reference_number: finalReferenceNumber || undefined,
      from_location_name: finalFromLocation || undefined,
      to_location_name: finalToLocation || undefined,
      batch_number: finalBatchNumber || undefined,
      expiry_date: finalExpiryDate || undefined
    }

    // Create the transaction using the service
    const result = await inventoryTransactionService.createTransaction(transactionInput)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      transaction: {
        id: result.transaction?.id,
        transaction_number: result.transaction?.transaction_number,
        type: result.transaction?.transaction_type,
        quantity: result.transaction?.quantity,
        status: result.transaction?.status,
        new_stock_level: result.new_stock_level,
        stock_updated: result.stock_updated,
        created_at: result.transaction?.created_at
      },
      success: true
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
