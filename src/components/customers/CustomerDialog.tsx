import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from 'react-hook-form';
import { useCustomers } from '@/hooks/useCustomers';
import { useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];

interface CustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

interface CustomerFormData {
  name: string;
  contact: string;
  email: string;
  phone: string;
  fax: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
  sort_name: string;
}

export function CustomerDialog({ isOpen, onClose, customer }: CustomerDialogProps) {
  const { createCustomer, updateCustomer } = useCustomers();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CustomerFormData>({
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      phone: '',
      fax: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      zip_code: '',
      sort_name: ''
    }
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (customer) {
        await updateCustomer.mutateAsync({ id: customer.id, ...data });
      } else {
        await createCustomer.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      // Error will be handled by the hook's onError callback
      console.error('Failed to save customer:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reset(customer ? {
        name: customer.name || '',
        contact: customer.contact || '',
        email: customer.email || '',
        phone: customer.phone || '',
        fax: customer.fax || '',
        address_line_1: customer.address_line_1 || '',
        address_line_2: customer.address_line_2 || '',
        city: customer.city || '',
        state: customer.state || '',
        zip_code: customer.zip_code || '',
        sort_name: customer.sort_name || ''
      } : {
        name: '',
        contact: '',
        email: '',
        phone: '',
        fax: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        zip_code: '',
        sort_name: ''
      });
    }
  }, [isOpen, customer, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          <DialogDescription>
            {customer ? 'Update the details of the customer.' : 'Add a new customer to your list of clients.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input 
                id="name" 
                {...register("name", { required: "Company name is required" })} 
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_name">Sort Name</Label>
              <Input 
                id="sort_name" 
                {...register("sort_name")} 
                placeholder="Optional alternate name for sorting"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Person</Label>
              <Input id="contact" {...register("contact")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                {...register("email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address"
                  }
                })} 
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input id="fax" {...register("fax")} />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Address</h4>
            <div className="space-y-2">
              <Label htmlFor="address_line_1">Address Line 1</Label>
              <Input id="address_line_1" {...register("address_line_1")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line_2">Address Line 2</Label>
              <Input id="address_line_2" {...register("address_line_2")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input id="zip_code" {...register("zip_code")} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (customer ? 'Save Changes' : 'Create Customer')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
