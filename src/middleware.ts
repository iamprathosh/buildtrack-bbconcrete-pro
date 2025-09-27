import { NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/database-server'

const isProtectedRoute = createRouteMatcher([
  '/',
  '/(dashboard|projects|inventory|operations|reports|settings|users)(.*)',
  '/profile(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Block access to any sign-up paths; force login only
  if (req.nextUrl.pathname.startsWith('/sign-up')) {
    const url = new URL('/sign-in', req.url)
    return NextResponse.redirect(url)
  }

  if (isProtectedRoute(req)) {
    await auth.protect()

    // Extra gate: ensure user has an active profile provisioned by admin
    if (userId) {
      try {
        const res = await supabaseServer
          .from('user_profiles')
          .select('is_active')
          .eq('id', userId)
          .single()

        const active = !!res.data?.is_active
        if (res.error || !active) {
          // Redirect to no-access page
          const url = new URL('/no-access', req.url)
          return NextResponse.redirect(url)
        }
      } catch (e) {
        const url = new URL('/no-access', req.url)
        return NextResponse.redirect(url)
      }
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
