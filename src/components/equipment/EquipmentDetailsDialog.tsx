"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useUser } from "@clerk/nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDatabase } from "@/lib/database"
import type { Equipment as DbEquipment } from "@/types/database"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface EquipmentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment: DbEquipment | null
  onChanged: () => void
}

export function EquipmentDetailsDialog({ open, onOpenChange, equipment, onChanged }: EquipmentDetailsDialogProps) {
  const { db, isReady } = useDatabase()
  const { user } = useUser()
  const [projects, setProjects] = useState<{ id: string, name: string }[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [txLoading, setTxLoading] = useState(false)
  const [txType, setTxType] = useState<"assign_to_project" | "assign_to_person" | "move_to_maintenance">("assign_to_project")
  const [txProjectId, setTxProjectId] = useState<string>("")
  const [txPerson, setTxPerson] = useState<string>("")
  const [txNotes, setTxNotes] = useState<string>("")
  const [txReturnDays, setTxReturnDays] = useState<string>("")

  // Edit form state
  const [editName, setEditName] = useState<string>("")
  const [editEquipmentNumber, setEditEquipmentNumber] = useState<string>("")
  const [editCategory, setEditCategory] = useState<string>("")
  const [editModel, setEditModel] = useState<string>("")
  const [editSerial, setEditSerial] = useState<string>("")
  const [editPurchaseDate, setEditPurchaseDate] = useState<string>("")
  const [editPurchaseCost, setEditPurchaseCost] = useState<string>("")
  const [editCurrentValue, setEditCurrentValue] = useState<string>("")
  const [editStatus, setEditStatus] = useState<DbEquipment["status"]>("available")
  const [editLocation, setEditLocation] = useState<string>("")
  const [editNotes, setEditNotes] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isReady || !open) return
    db.from("projects").select("id,name").order("name")
      .then(({ data }) => setProjects((data as any) || []))
  }, [db, isReady, open])

  useEffect(() => {
    if (!isReady || !equipment || !open) return
    setLoadingHistory(true)
    db.from("equipment_transactions").select("*", { count: "exact" }).eq("equipment_id", equipment.id).order("created_at", { ascending: false })
      .then(({ data }) => setHistory((data as any) || []))
      .finally(() => setLoadingHistory(false))
  }, [db, isReady, equipment?.id, open])

  // Populate edit form when opening or equipment changes
  useEffect(() => {
    if (!equipment || !open) return
    setEditName(equipment.name || '')
    setEditEquipmentNumber(equipment.equipment_number || '')
    setEditCategory(equipment.category || '')
    setEditModel(equipment.model || '')
    setEditSerial(equipment.serial_number || '')
    setEditPurchaseDate(equipment.purchase_date || '')
    setEditPurchaseCost(equipment.purchase_cost != null ? String(equipment.purchase_cost) : '')
    setEditCurrentValue(equipment.current_value != null ? String(equipment.current_value) : '')
    setEditStatus((equipment.status as DbEquipment['status']) || 'available')
    setEditLocation(equipment.location || '')
    setEditNotes(equipment.notes || '')
    setSelectedFile(undefined)
    setPreviewUrl(equipment.image_url || null)
  }, [equipment?.id, open])

  // Helpers to make DB operations resilient if columns are missing in DB
  const getDoneBy = () => user?.fullName || (user?.primaryEmailAddress as any)?.emailAddress || user?.username || user?.id || null
  const isMissingColumnError = (err: any) => {
    const code = err?.code
    const msg = err?.message || ''
    if (code === 'PGRST204') return true
    if (typeof msg === 'string' && (/column .* does not exist/i.test(msg) || /schema cache/i.test(msg))) return true
    return false
  }
  const isMissingRelationError = (err: any) => typeof err?.message === 'string' && /relation .* does not exist/i.test(err.message)

  const safeInsertTx = async (payload: any): Promise<boolean> => {
    const { error } = await db.from('equipment_transactions').insert(payload)
    if (!error) return true
    if (isMissingRelationError(error)) {
      console.warn('equipment_transactions table missing; skipping history insert')
      return false
    }
    if (isMissingColumnError(error)) {
      const fallbackPayload = { ...payload }
      delete (fallbackPayload as any).done_by
      delete (fallbackPayload as any).expected_return_date
      const { error: err2 } = await db.from('equipment_transactions').insert(fallbackPayload)
      if (!err2) return true
      console.warn('History insert failed even after fallback:', err2)
      return false
    }
    console.warn('History insert failed:', error)
    return false
  }

  const safeUpdateEquipment = async (id: string, payload: Partial<DbEquipment>) => {
    const { error } = await db.from('equipment').update(payload).eq('id', id)
    if (!error) return
    if (isMissingColumnError(error)) {
      const fallbackPayload = { ...payload } as any
      delete (fallbackPayload as any).maintenance_expected_return_date
      const { error: err2 } = await db.from('equipment').update(fallbackPayload).eq('id', id)
      if (err2) throw err2
      return
    }
    throw error
  }

  const handleAssign = async () => {
    if (!isReady || !equipment) return
    setTxLoading(true)
    try {
      if (txType === "assign_to_project" && !txProjectId) {
        toast.error("Please select a project")
        setTxLoading(false); return
      }
      if (txType === 'move_to_maintenance') {
        const days = Number(txReturnDays)
        if (!txReturnDays || Number.isNaN(days) || days <= 0) {
          toast.error("Enter expected return days (> 0)")
          setTxLoading(false); return
        }
      }

      let notesCombined = txNotes || ''
      if (txType === 'move_to_maintenance' && txReturnDays) {
        notesCombined = `${notesCombined} (Expected return: ${txReturnDays} day${txReturnDays === '1' ? '' : 's'})`.trim()
      }

      const expectedReturnDate = (txType === 'move_to_maintenance' && txReturnDays)
        ? new Date(Date.now() + Number(txReturnDays) * 24 * 60 * 60 * 1000).toISOString()
        : null

      const txPayload: any = {
        equipment_id: equipment.id,
        action: txType,
        project_id: txType === "assign_to_project" ? txProjectId : null,
        person_name: txType === "assign_to_person" ? txPerson : null,
        done_by: getDoneBy(),
        expected_return_date: expectedReturnDate,
        notes: notesCombined || null,
      }
      await safeInsertTx(txPayload)

      if (txType === 'move_to_maintenance') {
        await safeUpdateEquipment(equipment.id, {
          status: "maintenance",
          checked_out_to: null,
          checked_out_date: null,
        })
      } else {
        const checked_out_to = txType === "assign_to_project" ? `Project:${projects.find(p => p.id === txProjectId)?.name || ""}` : `Person:${txPerson}`
        await safeUpdateEquipment(equipment.id, {
          status: "checked_out",
          checked_out_to,
          checked_out_date: new Date().toISOString() as any,
        })
      }

      onChanged()
      const { data } = await db.from("equipment_transactions").select("*").eq("equipment_id", equipment.id).order("created_at", { ascending: false })
      setHistory((data as any) || [])
      setTxNotes("")
      setTxPerson("")
      setTxReturnDays("")
      toast.success(txType === 'move_to_maintenance' ? 'Moved to maintenance' : (txType === 'assign_to_project' ? 'Assigned to project' : 'Assigned to person'))
    } catch (e: any) {
      console.error('Transaction error', e)
      const msg = e?.message || e?.details || e?.hint || JSON.stringify(e)
      toast.error(msg)
    } finally {
      setTxLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!isReady || !equipment) return
    setTxLoading(true)
    try {
      await safeInsertTx({
        equipment_id: equipment.id,
        action: 'check_in',
        done_by: getDoneBy(),
        notes: txNotes || null,
      })

      await safeUpdateEquipment(equipment.id, {
        status: "available",
        checked_out_to: null,
        checked_out_date: null,
      })

      onChanged()
      const { data } = await db.from("equipment_transactions").select("*").eq("equipment_id", equipment.id).order("created_at", { ascending: false })
      setHistory((data as any) || [])
      setTxNotes("")
      toast.success('Checked in')
    } catch (e: any) {
      console.error('Check-in error', e)
      const msg = e?.message || e?.details || e?.hint || JSON.stringify(e)
      toast.error(msg)
    } finally {
      setTxLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!isReady || !equipment) return
    setTxLoading(true)
    try {
      let image_url: string | null | undefined = previewUrl || equipment.image_url || null

      if (selectedFile) {
        const bucket = 'equipment-images'
        const filePath = `${Date.now()}-${selectedFile.name}`.replace(/\s+/g, '_')
        const { data: uploadData, error: uploadError } = await db.storage.from(bucket).upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })
        if (uploadError) throw uploadError
        const { data: publicUrl } = db.storage.from(bucket).getPublicUrl(uploadData.path)
        image_url = publicUrl.publicUrl
      }

      const updatePayload: Partial<DbEquipment> = {
        name: editName,
        equipment_number: editEquipmentNumber,
        category: editCategory || null,
        model: editModel || null,
        serial_number: editSerial || null,
        purchase_date: editPurchaseDate || null,
        purchase_cost: editPurchaseCost !== '' ? Number(editPurchaseCost) : null,
        current_value: editCurrentValue !== '' ? Number(editCurrentValue) : null,
        status: editStatus,
        location: editLocation || null,
        notes: editNotes || null,
        image_url: image_url || null,
        updated_at: new Date().toISOString(),
      }

      const { error: upErr } = await db.from('equipment').update(updatePayload).eq('id', equipment.id)
      if (upErr) throw upErr

      onChanged()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Save failed')
    } finally {
      setTxLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-3xl md:max-w-4xl p-0">
        <DialogHeader className="sticky top-0 z-10 border-b bg-background p-6">
          <DialogTitle className="truncate">{equipment?.name || "Equipment"}</DialogTitle>
          <DialogDescription className="truncate">{equipment?.equipment_number} • {equipment?.model || "-"}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* Top summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
            <div>
              <div className="text-muted-foreground">Status</div>
              <div><Badge variant="outline">{equipment?.status}</Badge></div>
            </div>
            <div>
              <div className="text-muted-foreground">Location</div>
              <div>{equipment?.location || '-'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Serial</div>
              <div>{equipment?.serial_number || '-'}</div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="mt-2">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="transact">Transact</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-2 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Checked Out To</div>
                  <div>{equipment?.checked_out_to || '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Checked Out Date</div>
                  <div>{equipment?.checked_out_date ? new Date(equipment.checked_out_date).toLocaleString() : '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Expected Return</div>
                  <div>{(() => {
                    const fromEquipment = (equipment as any)?.maintenance_expected_return_date
                    const fromHistory = (history.find((h:any)=>h.action==='move_to_maintenance')||{}).expected_return_date
                    const val = fromEquipment || fromHistory
                    return val ? new Date(val).toLocaleString() : '-'
                  })()}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-muted-foreground">Notes</div>
                  <div>{equipment?.notes || '-'}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="images" className="mt-4">
              {equipment?.image_url ? (
                <img src={equipment.image_url} alt={equipment.name} className="w-full max-h-80 object-contain rounded-md border" />
              ) : (
                <div className="text-sm text-muted-foreground">No image uploaded.</div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {loadingHistory ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading history…</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Person</TableHead>
                        <TableHead>Done By</TableHead>
                        <TableHead>Expected Return</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No transactions yet.</TableCell></TableRow>
                      ) : history.map((h: any) => (
                        <TableRow key={h.id}>
                          <TableCell>{new Date(h.created_at).toLocaleString()}</TableCell>
                          <TableCell>{h.action}</TableCell>
                          <TableCell>{h.project_id || '-'}</TableCell>
                          <TableCell>{h.person_name || '-'}</TableCell>
                          <TableCell>{h.done_by || '-'}</TableCell>
                          <TableCell>{h.expected_return_date ? new Date(h.expected_return_date).toLocaleString() : '-'}</TableCell>
                          <TableCell className="max-w-[300px] truncate" title={h.notes || ''}>{h.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transact" className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Transaction Type</div>
                  <Select defaultValue={txType} onValueChange={(v) => setTxType(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign_to_project">Assign to Project</SelectItem>
                      <SelectItem value="assign_to_person">Assign to Person</SelectItem>
                      <SelectItem value="move_to_maintenance">Move to Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {txType === "assign_to_project" ? (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Project</div>
                    <Select onValueChange={setTxProjectId}>
                      <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : txType === 'assign_to_person' ? (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Person</div>
                    <Input placeholder="Person name" value={txPerson} onChange={(e) => setTxPerson(e.target.value)} />
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Expected Return (days)</div>
                    <Input type="number" min="1" placeholder="e.g. 7" value={txReturnDays} onChange={(e) => setTxReturnDays(e.target.value)} />
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Notes</div>
                <Textarea rows={3} value={txNotes} onChange={(e) => setTxNotes(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleAssign} disabled={txLoading}>{txLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving</> : (txType === 'move_to_maintenance' ? 'Move to Maintenance' : 'Save Assignment')}</Button>
                <Button variant="outline" onClick={handleCheckIn} disabled={txLoading}>{txLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving</> : "Check In"}</Button>
              </div>
            </TabsContent>

            <TabsContent value="edit" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_name">Name</Label>
                  <Input id="edit_name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit_equipment_number">Equipment #</Label>
                  <Input id="edit_equipment_number" value={editEquipmentNumber} onChange={(e) => setEditEquipmentNumber(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit_category">Category</Label>
                  <Input id="edit_category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit_model">Model</Label>
                  <Input id="edit_model" value={editModel} onChange={(e) => setEditModel(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit_serial">Serial Number</Label>
                  <Input id="edit_serial" value={editSerial} onChange={(e) => setEditSerial(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit_status">Status</Label>
                  <Select defaultValue={editStatus} onValueChange={(v) => setEditStatus(v as DbEquipment['status'])}>
                    <SelectTrigger id="edit_status"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="checked_out">Checked Out</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_location">Location</Label>
                  <Input id="edit_location" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit_purchase_date">Purchase Date</Label>
                  <Input id="edit_purchase_date" type="date" value={editPurchaseDate || ''} onChange={(e) => setEditPurchaseDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit_purchase_cost">Purchase Cost</Label>
                  <Input id="edit_purchase_cost" type="number" step="0.01" value={editPurchaseCost} onChange={(e) => setEditPurchaseCost(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit_current_value">Current Value</Label>
                  <Input id="edit_current_value" type="number" step="0.01" value={editCurrentValue} onChange={(e) => setEditCurrentValue(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="edit_notes">Notes</Label>
                  <Textarea id="edit_notes" rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="edit_image">Photo</Label>
                  <Input id="edit_image" type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      setSelectedFile(f)
                      const url = URL.createObjectURL(f)
                      setPreviewUrl(url)
                    }
                  }} />
                  {previewUrl && (
                    <img src={previewUrl} alt="Preview" className="h-32 w-32 object-cover rounded-md border" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSaveEdit} disabled={txLoading}>{txLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving</> : 'Save Changes'}</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
