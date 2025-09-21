"use client"

import { useEffect, useMemo, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDatabase } from "@/lib/database"
import type { Equipment as DbEquipment } from "@/types/database"
import { Loader2 } from "lucide-react"

interface EquipmentDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment: DbEquipment | null
  onChanged: () => void
}

export function EquipmentDetailsSheet({ open, onOpenChange, equipment, onChanged }: EquipmentDetailsSheetProps) {
  const { db, isReady } = useDatabase()
  const [tab, setTab] = useState("details")
  const [projects, setProjects] = useState<{ id: string, name: string }[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [txLoading, setTxLoading] = useState(false)
  const [txType, setTxType] = useState<"assign_to_project" | "assign_to_person">("assign_to_project")
  const [txProjectId, setTxProjectId] = useState<string>("")
  const [txPerson, setTxPerson] = useState<string>("")
  const [txNotes, setTxNotes] = useState<string>("")

  useEffect(() => {
    if (!isReady || !open) return
    // Load projects for select
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

  const handleAssign = async () => {
    if (!isReady || !equipment) return
    setTxLoading(true)
    try {
      if (txType === "assign_to_project" && !txProjectId) {
        setTxLoading(false); return
      }

      // Insert transaction
      const { error: txErr } = await db.from("equipment_transactions").insert({
        equipment_id: equipment.id,
        action: txType,
        project_id: txType === "assign_to_project" ? txProjectId : null,
        person_name: txType === "assign_to_person" ? txPerson : null,
        notes: txNotes || null,
      })
      if (txErr) throw txErr

      // Update equipment status and assignee
      const checked_out_to = txType === "assign_to_project" ? `Project:${projects.find(p => p.id === txProjectId)?.name || ""}` : `Person:${txPerson}`
      const { error: upErr } = await db.from("equipment").update({
        status: "checked_out",
        checked_out_to,
        checked_out_date: new Date().toISOString(),
      }).eq("id", equipment.id)
      if (upErr) throw upErr

      // Refresh
      onChanged()
      // Reload history
      const { data } = await db.from("equipment_transactions").select("*").eq("equipment_id", equipment.id).order("created_at", { ascending: false })
      setHistory((data as any) || [])
      setTxNotes("")
      setTxPerson("")
    } catch (e) {
      console.error(e)
    } finally {
      setTxLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!isReady || !equipment) return
    setTxLoading(true)
    try {
      const { error: txErr } = await db.from("equipment_transactions").insert({
        equipment_id: equipment.id,
        action: "check_in",
        notes: txNotes || null,
      })
      if (txErr) throw txErr

      const { error: upErr } = await db.from("equipment").update({
        status: "available",
        checked_out_to: null,
        checked_out_date: null,
      }).eq("id", equipment.id)
      if (upErr) throw upErr

      onChanged()
      const { data } = await db.from("equipment_transactions").select("*").eq("equipment_id", equipment.id).order("created_at", { ascending: false })
      setHistory((data as any) || [])
      setTxNotes("")
    } catch (e) {
      console.error(e)
    } finally {
      setTxLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{equipment?.name || "Equipment"}</SheetTitle>
          <SheetDescription>{equipment?.equipment_number} • {equipment?.model || "-"}</SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="details" className="mt-4" onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="transact">Transact</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-2 mt-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-muted-foreground">Status</div><div><Badge variant="outline">{equipment?.status}</Badge></div></div>
              <div><div className="text-muted-foreground">Location</div><div>{equipment?.location || '-'}</div></div>
              <div><div className="text-muted-foreground">Serial</div><div>{equipment?.serial_number || '-'}</div></div>
              <div><div className="text-muted-foreground">Model</div><div>{equipment?.model || '-'}</div></div>
              <div><div className="text-muted-foreground">Checked Out To</div><div>{equipment?.checked_out_to || '-'}</div></div>
              <div><div className="text-muted-foreground">Checked Out Date</div><div>{equipment?.checked_out_date ? new Date(equipment.checked_out_date).toLocaleString() : '-'}</div></div>
              <div className="col-span-2"><div className="text-muted-foreground">Notes</div><div>{equipment?.notes || '-'}</div></div>
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
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No transactions yet.</TableCell></TableRow>
                    ) : history.map((h: any) => (
                      <TableRow key={h.id}>
                        <TableCell>{new Date(h.created_at).toLocaleString()}</TableCell>
                        <TableCell>{h.action}</TableCell>
                        <TableCell>{h.project_id || '-'}</TableCell>
                        <TableCell>{h.person_name || '-'}</TableCell>
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
              ) : (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Person</div>
                  <Input placeholder="Person name" value={txPerson} onChange={(e) => setTxPerson(e.target.value)} />
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Notes</div>
              <Textarea rows={3} value={txNotes} onChange={(e) => setTxNotes(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAssign} disabled={txLoading}>{txLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving</> : "Save Assignment"}</Button>
              <Button variant="outline" onClick={handleCheckIn} disabled={txLoading}>{txLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving</> : "Check In"}</Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}