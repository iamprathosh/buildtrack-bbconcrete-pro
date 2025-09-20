import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import SettingsView from '@/components/dashboard/settings/SettingsView'

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SettingsView user={session.user} />
      </main>
    </div>
  )
}