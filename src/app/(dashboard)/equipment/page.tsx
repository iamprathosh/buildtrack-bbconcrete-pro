import { EquipmentView } from '@/components/equipment/EquipmentView'

export default function EquipmentPage() {
  return (
    <div className="p-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Equipment Management</h1>
          <p className="text-muted-foreground">
            Track and manage your construction equipment, machinery, and assets
          </p>
        </div>
        <EquipmentView />
      </div>
    </div>
  )
}