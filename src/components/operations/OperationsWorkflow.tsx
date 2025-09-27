"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Minus, Trash2, TrendingDown, TrendingUp, RotateCcw, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { AddItemDialog } from "@/components/inventory/AddItemDialog"
import type { InventoryItem } from "@/components/inventory/InventoryView"

// Types for products/projects
interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  unit: string
  minLevel: number
  category: string
  imageUrl?: string
}

interface Project {
  id: string
  name: string
  status: string
}

// Line item in the workflow
interface LineItem {
  productId: string
  productName: string
  sku: string
  unit: string
  currentStock: number
  quantity: number
  unitCost?: number | null
}

const stepSchema = z.object({
  type: z.enum(["IN", "OUT", "RETURN"]),
  projectId: z.string().optional(),
  reason: z.string().optional()
})

export function OperationsWorkflow({ initialType = "OUT", onComplete }: { initialType?: "IN" | "OUT" | "RETURN"; onComplete?: () => void }) {
  const { toast } = useToast()
  const [step, setStep] = useState<number>(0)
  const [products, setProducts] = useState<Product[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // Product filters
  const [productSearch, setProductSearch] = useState('')
  const [productCategory, setProductCategory] = useState<'all' | string>('all')
  const [productStatus, setProductStatus] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')
  const [categories, setCategories] = useState<string[]>([])

  const [items, setItems] = useState<LineItem[]>([])
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)

  const form = useForm<z.infer<typeof stepSchema>>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      type: initialType,
      projectId: undefined,
      reason: ""
    }
  })

  // keep type synced
  useEffect(() => {
    form.setValue("type", initialType)
  }, [initialType])

  const watchType = form.watch("type")
  const requiresProject = watchType === "OUT" || watchType === "RETURN"
  const lockType = true

  // Fetch products/projects
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true)
        const params = new URLSearchParams()
        if (productCategory !== 'all') params.set('category', productCategory)
        if (productStatus !== 'all') params.set('status', productStatus)
        if (productSearch) params.set('search', productSearch)
        params.set('limit', '200')
        const prodRes = await fetch(`/api/products?${params.toString()}`)
        if (prodRes.ok) {
          const pj = await prodRes.json()
          const mapped: Product[] = (pj.products || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            currentStock: p.current_stock || 0,
            unit: p.unit_of_measure,
            minLevel: p.min_stock_level || 0,
            category: p.category || "Uncategorized",
            imageUrl: p.image_url || undefined
          }))
          setProducts(mapped)
          if (categories.length === 0) {
            const uniqueCats = Array.from(new Set(mapped.map(p => p.category).filter(Boolean))) as string[]
            setCategories(uniqueCats)
          }
        }
      } finally {
        setLoadingProducts(false)
      }
    }
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true)
        const projRes = await fetch("/api/projects")
        if (projRes.ok) {
          const rj = await projRes.json()
          setProjects(rj.projects || [])
        }
      } finally {
        setLoadingProjects(false)
      }
    }
    fetchProducts()
    fetchProjects()
  }, [productCategory, productStatus, productSearch])

  const currentStepList = useMemo(() => {
    // Steps: [Project?] -> Items -> Reason -> Review
    if (requiresProject) return ["Project", "Items", "Reason", "Review"]
    return ["Items", "Reason", "Review"]
  }, [requiresProject])

  const totalSteps = currentStepList.length

  const getStepHelpText = () => {
    const stepName = currentStepList[step]
    if (stepName === 'Project') {
      return 'Choose the project for this transaction. Required for Stock Out and Return.'
    }
    if (stepName === 'Items') {
      if (watchType === 'IN') return 'Select products to add to stock. Use +/- to set quantities and enter unit cost for each.'
      if (watchType === 'OUT') return 'Select products to dispatch. Use +/- to set quantities; cannot exceed available stock.'
      return 'Select products being returned to stock. Use +/- to set quantities.'
    }
    if (stepName === 'Reason') return 'Optionally add a reason or notes for this transaction.'
    if (stepName === 'Review') return 'Confirm details. Submitting will create one transaction per selected item.'
    return ''
  }

  // Helpers
  const canProceedFromProject = () => {
    if (!requiresProject) return true
    return !!form.getValues("projectId")
  }

  const canProceedFromItems = () => {
    if (items.length === 0) return false
    if (watchType === "OUT") {
      // Ensure all quantities valid
      return items.every((it) => it.quantity > 0 && it.quantity <= it.currentStock)
    }
    if (watchType === "IN") {
      return items.every((it) => it.quantity > 0 && it.unitCost != null && Number(it.unitCost) > 0)
    }
    // RETURN
    return items.every((it) => it.quantity > 0)
  }

  const goNext = () => {
    if (step >= totalSteps - 1) return
    // Validate gating
    const stepName = currentStepList[step]
    if (stepName === "Project" && !canProceedFromProject()) return
    if (stepName === "Items" && !canProceedFromItems()) return
    setStep((s) => s + 1)
  }

  const goBack = () => setStep((s) => Math.max(0, s - 1))

  const selectedProject = useMemo(() => {
    const id = form.getValues("projectId")
    return projects.find((p) => p.id === id)
  }, [projects, form.watch("projectId")])

  // Item operations
  const addItem = (productId: string) => {
    const p = products.find((pp) => pp.id === productId)
    if (!p) return
    setItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.productId === productId)
      if (existingIdx >= 0) {
        const copy = [...prev]
        copy[existingIdx] = { ...copy[existingIdx], quantity: copy[existingIdx].quantity + 1 }
        return copy
      }
      return [
        ...prev,
        {
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          unit: p.unit,
          currentStock: p.currentStock,
          quantity: 1,
          unitCost: watchType === "IN" ? null : undefined
        }
      ]
    })
  }

  const deselectItem = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId))
  }

  const handleNewItemAdded = (newItem: InventoryItem) => {
    const newProduct: Product = {
      id: newItem.id,
      name: newItem.name,
      sku: newItem.sku,
      currentStock: newItem.currentStock,
      unit: newItem.unit,
      minLevel: newItem.minLevel,
      category: newItem.category,
      imageUrl: newItem.imageUrl
    }
    setProducts(prev => [newProduct, ...prev])
    // Auto-select the newly created product
    addItem(newProduct.id)
    setShowAddItemDialog(false)
    toast({ title: 'Product added', description: `${newProduct.name} was added to inventory and selected.` })
  }

  const updateItem = (index: number, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  const updateItemById = (productId: string, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((it) => (it.productId === productId ? { ...it, ...patch } : it)))
  }

  const adjustQuantity = (productId: string, delta: number) => {
    setItems((prev) => {
      const prod = products.find((p) => p.id === productId)
      const stock = prod?.currentStock ?? Number.MAX_SAFE_INTEGER
      return prev.map((it) => {
        if (it.productId !== productId) return it
        let next = (it.quantity || 1) + delta
        if (next < 1) next = 1
        if (watchType === 'OUT') next = Math.min(next, stock)
        return { ...it, quantity: next }
      })
    })
  }

  const setQuantityFromInput = (productId: string, raw: string) => {
    setItems((prev) => {
      const prod = products.find((p) => p.id === productId)
      const stock = prod?.currentStock ?? Number.MAX_SAFE_INTEGER
      const nextVal = Number(raw)
      let next = Number.isFinite(nextVal) && nextVal > 0 ? Math.floor(nextVal) : 1
      if (watchType === 'OUT') next = Math.min(next, stock)
      return prev.map((it) => (it.productId === productId ? { ...it, quantity: next } : it))
    })
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitAll = async () => {
    setSubmitting(true)
    try {
      const reason = form.getValues("reason")?.trim() || undefined
      const projectName = selectedProject?.name || (requiresProject ? undefined : undefined)

      // Require unit cost for Stock In
      if (watchType === 'IN') {
        const missing = items.find((it) => it.unitCost == null || Number(it.unitCost) <= 0)
        if (missing) {
          toast({ title: 'Missing unit cost', description: `Please enter a unit cost for ${missing.productName}.`, variant: 'destructive' })
          setSubmitting(false)
          return
        }
      }

      const results: { ok: boolean; error?: string; item?: LineItem }[] = []

      for (const item of items) {
        const payload: any = {
          transaction_type: watchType,
          product_id: item.productId,
          quantity: item.quantity,
          project_name: projectName,
          reason,
        }
        if (item.unitCost != null && item.unitCost !== undefined && item.unitCost !== 0) {
          payload.unit_cost = item.unitCost
        }

        const res = await fetch("/api/simple-transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          results.push({ ok: false, error: data?.error || "Failed", item })
          // For OUT, failing one may invalidate subsequent due to stock levels; continue to report all
          continue
        }
        results.push({ ok: true })
      }

      const failures = results.filter((r) => !r.ok)
      if (failures.length === 0) {
        toast({ title: "Transactions completed", description: `${items.length} ${watchType.toLowerCase()} transaction(s) recorded.` })
        // Reset
        setItems([])
        if (onComplete) onComplete()
      } else {
        toast({
          title: "Partial success",
          description: `${items.length - failures.length} succeeded, ${failures.length} failed. ${failures[0]?.error || ""}`,
          variant: "destructive"
        })
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Transaction failed", description: "Unexpected error", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  // Render step header
  const StepHeader = () => (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {currentStepList.map((label, i) => {
        const active = i === step
        const completed = i < step
        return (
          <React.Fragment key={label}>
            <div className={`flex items-center gap-2 shrink-0 ${active ? "font-semibold" : "text-muted-foreground"}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${completed ? "bg-green-600 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {i + 1}
              </div>
              <span>{label}</span>
            </div>
            {i < currentStepList.length - 1 && (
              <Separator orientation="vertical" className="h-6 mx-2 shrink-0" />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {watchType === "RETURN" ? 'Record Return' : null}
          </CardTitle>
          <CardDescription>{getStepHelpText()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type selector to allow switching mid-flow if needed */}
          <Form {...form}>
            <div className="grid gap-6">
              {/* Transaction type locked by entry point; no selector displayed */}
              {null}

              <StepHeader />

              {/* Step content */}
              {/* Project step */}
              {requiresProject && currentStepList[step] === "Project" && (
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project <span className="text-red-500">*</span></FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingProjects ? "Loading..." : "Select project"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-64 overflow-y-auto">
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{p.name}</span>
                                <Badge variant="outline">{p.status}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Items step */}
              {currentStepList[step] === (requiresProject ? "Items" : "Items") && (
                <div className="space-y-4">
                  {/* Product filters */}
                  <div className="grid gap-2 md:grid-cols-3">
                    <Input
                      placeholder="Search name or SKU"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                    <Select value={productCategory} onValueChange={(v) => setProductCategory(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={productStatus} onValueChange={(v) => setProductStatus(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="in-stock">In Stock</SelectItem>
                        <SelectItem value="low-stock">Low Stock</SelectItem>
                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {watchType === 'IN' && (
                    <div className="flex items-center justify-between p-3 rounded-md border bg-muted/40">
                      <div className="text-sm text-muted-foreground">Adding a brand new item?</div>
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowAddItemDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add New Item
                      </Button>
                    </div>
                  )}
                  {products.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No products available.</div>
                  ) : (
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {products.map((p) => {
                        const idx = items.findIndex((it) => it.productId === p.id)
                        const selected = idx >= 0
                        const it = selected ? items[idx] : undefined
                        const insufficient = selected && watchType === "OUT" && (it!.quantity > p.currentStock)
                        return (
                          <Card key={p.id} className={`relative overflow-hidden border-2 ${selected ? 'border-primary' : ''}`}>
                            {selected && (
                              <div className="absolute top-2 right-2">
                                <Badge variant="default" className="bg-primary text-primary-foreground shadow-lg px-3 py-1.5 rounded-full text-sm font-bold">x{it!.quantity}</Badge>
                              </div>
                            )}
                            <div className="h-24 bg-muted flex items-center justify-center">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="h-24 w-full object-cover" />
                              ) : (
                                <div className="text-xs text-muted-foreground">No image</div>
                              )}
                            </div>
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-medium truncate" title={p.name}>{p.name}</div>
                                <Badge variant="outline">SKU: {p.sku}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">Stock: {p.currentStock} {p.unit}</div>

                              {!selected ? (
                                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => addItem(p.id)}>
                                  Select
                                </Button>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        onClick={() => adjustQuantity(p.id, -1)}
                                        aria-label={`Decrease quantity of ${p.name}`}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        onClick={() => adjustQuantity(p.id, +1)}
                                        aria-label={`Increase quantity of ${p.name}`}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => deselectItem(p.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {watchType === 'IN' && (
                                    <div>
                                      <Label className="text-xs">Unit Cost <span className="text-red-500">*</span></Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        className={`${(it!.unitCost == null || Number(it!.unitCost) <= 0) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        value={it!.unitCost ?? ''}
                                        onChange={(e) => updateItemById(p.id, { unitCost: e.target.value === '' ? null : Number(e.target.value) })}
                                      />
                                      {(it!.unitCost == null || Number(it!.unitCost) <= 0) && (
                                        <div className="text-xs text-red-600 mt-1">Unit cost is required for Stock In.</div>
                                      )}
                                    </div>
                                  )}

                                  {insufficient && (
                                    <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 p-2 rounded">
                                      <AlertTriangle className="h-4 w-4" /> Insufficient stock for this item.
                                    </div>
                                  )}
                                  {watchType === 'OUT' && !insufficient && (p.currentStock - (it!.quantity || 0)) <= (p.currentStock * 0.1) && (
                                    <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 p-2 rounded">
                                      <AlertTriangle className="h-4 w-4" /> Stock will be low after this transaction.
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Reason step */}
              {currentStepList[step] === "Reason" && (
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason (optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Add a reason (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Review step */}
              {currentStepList[step] === "Review" && (
                <div className="space-y-3">
                  {requiresProject && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Project:</span>
                      <span className="font-medium">{selectedProject?.name || "-"}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Items:</div>
                    {items.map((it, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{it.productName} ({it.sku})</span>
                        <span>
                          {watchType === "OUT" ? "-" : "+"}
                          {it.quantity} {it.unit}
                          {watchType === "IN" && it.unitCost ? ` • $${Number(it.unitCost).toFixed(2)}/u` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                  {form.getValues("reason") && (
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground">Reason:</span>
                      <span className="font-medium max-w-[70%] text-right">{form.getValues("reason")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>Back</Button>
                {step < totalSteps - 1 ? (
                  <Button type="button" onClick={goNext} disabled={(currentStepList[step] === "Project" && !canProceedFromProject()) || (currentStepList[step] === "Items" && !canProceedFromItems())}>
                    Next
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmitAll} disabled={submitting || items.length === 0 || (requiresProject && !selectedProject) || (watchType === 'IN' && items.some((it) => it.unitCost == null || Number(it.unitCost) <= 0))}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Submit
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
      {watchType === 'IN' && (
        <AddItemDialog
          isOpen={showAddItemDialog}
          onClose={() => setShowAddItemDialog(false)}
          onItemAdded={handleNewItemAdded}
        />
      )}
    </div>
  )
}
