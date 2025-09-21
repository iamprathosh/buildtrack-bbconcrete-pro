'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2, Camera, Image as ImageIcon } from 'lucide-react'
import { useDatabase } from '@/lib/database'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  equipment_number: z.string().min(1, 'Equipment # is required'),
  category: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serial_number: z.string().optional().nullable(),
  purchase_date: z.string().optional().nullable(),
  purchase_cost: z.coerce.number().optional().nullable(),
  current_value: z.coerce.number().optional().nullable(),
  status: z.enum(['available', 'checked_out', 'maintenance', 'retired']).default('available'),
  location: z.string().optional().nullable(),
  checked_out_to: z.string().optional().nullable(),
  checked_out_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  photo: z.any().optional(),
})

export type AddEquipmentForm = z.infer<typeof schema>

interface AddEquipmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onEquipmentAdded: () => void
  categories?: string[]
  locations?: string[]
  manufacturers?: string[]
}

export function AddEquipmentDialog({ isOpen, onClose, onEquipmentAdded, categories = [], locations = [] }: AddEquipmentDialogProps) {
  const { db, isReady } = useDatabase()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<AddEquipmentForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'available',
    },
  })

  const onSubmit = useCallback(async (values: AddEquipmentForm) => {
    if (!isReady) return
    setSubmitting(true)
    setError(null)

    try {
      let image_url: string | null = null

      // Upload photo if provided (from selectedFile or form field as fallback)
      const fileList = (values as any).photo as FileList | undefined
      const file = selectedFile || (fileList && fileList.length > 0 ? fileList[0] : undefined)

      if (file) {
        const bucket = 'equipment-images'
        const filePath = `${Date.now()}-${file.name}`.replace(/\s+/g, '_')
        const { data: uploadData, error: uploadError } = await db.storage.from(bucket).upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })
        if (uploadError) throw uploadError

        const { data: publicUrl } = db.storage.from(bucket).getPublicUrl(uploadData.path)
        image_url = publicUrl.publicUrl
      }

      const now = new Date().toISOString()
      const insertPayload = {
        name: values.name,
        equipment_number: values.equipment_number,
        category: values.category || null,
        model: values.model || null,
        serial_number: values.serial_number || null,
        purchase_date: values.purchase_date || null,
        purchase_cost: values.purchase_cost ?? null,
        current_value: values.current_value ?? null,
        status: values.status,
        location: values.location || null,
        checked_out_to: values.checked_out_to || null,
        checked_out_date: values.checked_out_date || null,
        notes: values.notes || null,
        image_url: image_url,
        created_at: now,
        updated_at: now,
      }

      const { error: insertError } = await db.from('equipment').insert(insertPayload)
      if (insertError) throw insertError

      onEquipmentAdded()
      onClose()
      form.reset({ status: 'available' })
    } catch (err: any) {
      setError(err?.message || 'Failed to add equipment')
    } finally {
      setSubmitting(false)
    }
  }, [db, isReady, onClose, onEquipmentAdded, form])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-3xl md:max-w-4xl p-0">
        <DialogHeader className="sticky top-0 z-10 border-b bg-background p-6">
          <DialogTitle>Add New Equipment</DialogTitle>
          <DialogDescription>Register new construction equipment or machinery</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {error && (
            <div className="mb-3 text-sm text-red-600">{error}</div>
          )}

          <form id="add-equipment-form" onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register('name')} placeholder="e.g. CAT 320 Excavator" />
          </div>
          <div>
            <Label htmlFor="equipment_number">Equipment #</Label>
            <Input id="equipment_number" {...form.register('equipment_number')} placeholder="e.g. EQ-0001" />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" list="category-list" {...form.register('category')} placeholder="e.g. Excavator" />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <Input id="model" {...form.register('model')} placeholder="e.g. 320" />
          </div>

          <div>
            <Label htmlFor="serial_number">Serial Number</Label>
            <Input id="serial_number" {...form.register('serial_number')} placeholder="e.g. CAT320-001" />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(v) => form.setValue('status', v as any)} defaultValue={form.getValues('status')}>
              <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" list="location-list" {...form.register('location')} placeholder="e.g. Main Depot" />
            <datalist id="location-list">
              {locations.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
          <div>
            <Label htmlFor="purchase_date">Purchase Date</Label>
            <Input id="purchase_date" type="date" {...form.register('purchase_date')} />
          </div>

          <div>
            <Label htmlFor="purchase_cost">Purchase Cost</Label>
            <Input id="purchase_cost" type="number" step="0.01" {...form.register('purchase_cost')} />
          </div>
          <div>
            <Label htmlFor="current_value">Current Value</Label>
            <Input id="current_value" type="number" step="0.01" {...form.register('current_value')} />
          </div>

          <div>
            <Label htmlFor="checked_out_to">Checked Out To</Label>
            <Input id="checked_out_to" {...form.register('checked_out_to')} />
          </div>
          <div>
            <Label htmlFor="checked_out_date">Checked Out Date</Label>
            <Input id="checked_out_date" type="date" {...form.register('checked_out_date')} />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...form.register('notes')} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Photo</Label>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => galleryInputRef.current?.click()}>
                <ImageIcon className="h-4 w-4 mr-2" /> Gallery
              </Button>
              <Button type="button" variant="outline" onClick={() => cameraInputRef.current?.click()}>
                <Camera className="h-4 w-4 mr-2" /> Camera
              </Button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) {
                    setSelectedFile(f)
                    const url = URL.createObjectURL(f)
                    setPreviewUrl(url)
                  }
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) {
                    setSelectedFile(f)
                    const url = URL.createObjectURL(f)
                    setPreviewUrl(url)
                  }
                }}
              />
            </div>
            {previewUrl && (
              <div className="pt-2">
                <img src={previewUrl} alt="Selected equipment" className="h-32 w-32 object-cover rounded-md border" />
              </div>
            )}
            <p className="text-xs text-muted-foreground">Choose from gallery or take a photo. On mobile, Camera opens the device camera.</p>
          </div>

        </form>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 border-t bg-background p-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button form="add-equipment-form" type="submit" disabled={submitting || !isReady}>
            {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving</>) : (<><Plus className="h-4 w-4 mr-2" />Add Equipment</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
