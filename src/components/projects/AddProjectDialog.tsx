'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Customer, UserProfile } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Project } from './ProjectsView'
import { CalendarIcon } from 'lucide-react'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  customerId: z.string().optional(),
  location: z.string().optional(),
  projectManagerId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number().min(0, 'Budget must be a positive number').optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate
    }
    return true
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
)

type ProjectFormValues = z.infer<typeof projectSchema>

interface AddProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  onProjectAdded: (project: Project) => void
}

export function AddProjectDialog({ isOpen, onClose, onProjectAdded }: AddProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      customerId: '',
      location: '',
      projectManagerId: '',
      budget: 0,
    },
  })

  // Fetch customers and users when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingData(true)
        try {
          const [customersResponse, usersResponse] = await Promise.all([
            fetch('/api/customers'),
            fetch('/api/users')
          ])

          if (customersResponse.ok) {
            const customersData = await customersResponse.json()
            setCustomers(customersData.customers || [])
          }

          if (usersResponse.ok) {
            const usersData = await usersResponse.json()
            setUsers(usersData.users || [])
          }
        } catch (error) {
          console.error('Error fetching dropdown data:', error)
        } finally {
          setLoadingData(false)
        }
      }

      fetchData()
    }
  }, [isOpen])

  const onSubmit = async (values: ProjectFormValues) => {
    setIsSubmitting(true)
    
    try {
      // Pass the form values directly to the parent handler
      // The parent will handle the API call
      await onProjectAdded(values as any)
      form.reset()
    } catch (error) {
      console.error('Failed to add project:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Create a new project to track progress, budget, and team collaboration.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter project description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer and Project Manager */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingData ? (
                          <SelectItem value="loading" disabled>Loading customers...</SelectItem>
                        ) : (
                          customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectManagerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Manager</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingData ? (
                          <SelectItem value="loading" disabled>Loading users...</SelectItem>
                        ) : (
                          users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {/* Dates and Budget */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      onDateChange={field.onChange}
                      placeholder="Select start date"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      onDateChange={field.onChange}
                      placeholder="Select end date"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}