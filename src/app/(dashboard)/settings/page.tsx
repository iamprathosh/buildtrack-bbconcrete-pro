import { SettingsView } from '@/components/settings/SettingsView'

export default function SettingsPage() {
  return (
    <div className="p-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure application settings, preferences, and integrations
          </p>
        </div>
        <SettingsView />
      </div>
    </div>
  )
}