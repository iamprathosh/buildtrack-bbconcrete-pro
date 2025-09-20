import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')
    const action = searchParams.get('action')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query
    let query = supabase
      .from('user_activities')
      .select(`
        id,
        user_id,
        actor_id,
        action,
        details,
        created_at,
        users!user_activities_user_id_fkey (
          first_name,
          last_name,
          avatar
        ),
        actors:users!user_activities_actor_id_fkey (
          first_name,
          last_name,
          avatar
        )
      `)

    // Filter by specific user if requested
    if (targetUserId) {
      query = query.eq('user_id', targetUserId)
    }

    // Filter by action type if requested
    if (action) {
      query = query.eq('action', action)
    }

    // Add pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // Order by most recent first
    query = query.order('created_at', { ascending: false })

    const { data: activities, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      )
    }

    // Transform data
    const transformedActivities = activities?.map(activity => ({
      id: activity.id,
      userId: activity.user_id,
      actorId: activity.actor_id,
      action: activity.action,
      details: activity.details,
      timestamp: new Date(activity.created_at),
      user: Array.isArray(activity.users) && activity.users.length > 0 ? {
        firstName: activity.users[0].first_name,
        lastName: activity.users[0].last_name,
        avatar: activity.users[0].avatar
      } : null,
      actor: Array.isArray(activity.actors) && activity.actors.length > 0 ? {
        firstName: activity.actors[0].first_name,
        lastName: activity.actors[0].last_name,
        avatar: activity.actors[0].avatar
      } : null
    })) || []

    return NextResponse.json({
      activities: transformedActivities,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

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
    const { targetUserId, action, details } = body

    if (!targetUserId || !action) {
      return NextResponse.json(
        { error: 'Target user ID and action are required' },
        { status: 400 }
      )
    }

    // Create activity log entry
    const { data: activity, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: targetUserId,
        actor_id: userId,
        action,
        details: details || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create activity log' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      activity: {
        id: activity.id,
        userId: activity.user_id,
        actorId: activity.actor_id,
        action: activity.action,
        details: activity.details,
        timestamp: new Date(activity.created_at)
      }
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}