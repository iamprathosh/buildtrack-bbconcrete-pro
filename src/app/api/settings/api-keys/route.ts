import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const createApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required')
})

function generateApiKey(): string {
  const prefix = 'bt_live_'
  const keyBytes = randomBytes(16)
  return prefix + keyBytes.toString('hex')
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization ID for the user
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', userId)
      .single()

    if (!userProfile?.organization_id) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 400 })
    }

    // Only admins can view API keys
    if (userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, name, permissions, created_at, last_used, is_active')
      .eq('organization_id', userProfile.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
    }

    const transformedKeys = apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      key: '••••••••••••••••', // Never return actual keys
      permissions: key.permissions,
      createdDate: new Date(key.created_at),
      lastUsed: key.last_used ? new Date(key.last_used) : undefined,
      isActive: key.is_active
    }))

    return NextResponse.json({ apiKeys: transformedKeys })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createApiKeySchema.parse(body)

    // Get organization ID for the user
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', userId)
      .single()

    if (!userProfile?.organization_id) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 400 })
    }

    // Only admins can create API keys
    if (userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Generate new API key
    const newApiKey = generateApiKey()

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({
        organization_id: userProfile.organization_id,
        name: validatedData.name,
        key_hash: newApiKey, // In production, this should be hashed
        permissions: validatedData.permissions,
        created_by: userId,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }

    // Log the activity
    await supabase.from('user_activities').insert({
      user_id: userId,
      action: 'api_key_created',
      details: {
        keyId: apiKey.id,
        keyName: validatedData.name,
        permissions: validatedData.permissions
      }
    })

    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: newApiKey, // Return the actual key only once when created
        permissions: apiKey.permissions,
        createdDate: new Date(apiKey.created_at)
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')

    if (!keyId) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 })
    }

    // Get organization ID for the user
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', userId)
      .single()

    if (!userProfile?.organization_id) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 400 })
    }

    // Only admins can delete API keys
    if (userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if the API key belongs to the user's organization
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('id, name')
      .eq('id', keyId)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq('id', keyId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
    }

    // Log the activity
    await supabase.from('user_activities').insert({
      user_id: userId,
      action: 'api_key_deleted',
      details: {
        keyId: apiKey.id,
        keyName: apiKey.name
      }
    })

    return NextResponse.json({ message: 'API key deleted successfully' })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}