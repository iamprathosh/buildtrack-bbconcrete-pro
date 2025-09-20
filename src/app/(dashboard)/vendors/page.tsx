import { VendorsView } from '@/components/vendors/VendorsView'

export default function VendorsPage() {
  return (
    <div className="p-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Vendor Management</h1>
          <p className="text-muted-foreground">
            Manage your suppliers, contractors, and vendor relationships
          </p>
        </div>
        <VendorsView />
      </div>
    </div>
  )
}