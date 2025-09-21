import { SettingsView } from '@/components/settings/SettingsView'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function SettingsPage() {
  return (
    <DashboardLayout
      title="Settings"
      subtitle="Configure application settings, preferences, and integrations"
    >
      <SettingsView />
    </DashboardLayout>
  )
}
