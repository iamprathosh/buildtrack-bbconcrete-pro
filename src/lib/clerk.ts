import { clerkClient } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'

// Server-side Clerk client is already a singleton by design
// This file provides additional utilities and ensures consistent usage

/**
 * Get the current user's authentication state on the server
 * This is a server-side only function
 */
export async function getAuthState() {
  try {
    const { userId, sessionId } = await auth()
    return { userId, sessionId, isAuthenticated: !!userId }
  } catch (error) {
    console.error('Error getting auth state:', error)
    return { userId: null, sessionId: null, isAuthenticated: false }
  }
}

/**
 * Get user data by ID (server-side only)
 */
export async function getUser(userId: string) {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

/**
 * Get current authenticated user (server-side only)
 */
export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  return getUser(userId)
}

// Export the Clerk client instance (already singleton)
export { clerkClient }