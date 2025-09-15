import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from 'react-hook-form';
import { useVendors } from '@/hooks/useVendors';
import { useEffect } from 'react';

export function VendorDialog({ isOpen, onClose, vendor }) {
  const { createVendor, updateVendor } = useVendors();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    if (vendor) {
      updateVendor.mutate({ id: vendor.id, ...data });
    } else {
      createVendor.mutate(data);
    }
    onClose();
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      reset(vendor || {});
    }
  }, [isOpen, vendor, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
          <DialogDescription>
            {vendor ? 'Update the details of the vendor.' : 'Add a new vendor to your list of suppliers.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" {...register("name", { required: true })} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact_name" className="text-right">Contact Name</Label>
            <Input id="contact_name" {...register("contact_name")} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" {...register("email")} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Phone</Label>
            <Input id="phone" {...register("phone")} className="col-span-3" />
          </div>
          <DialogFooter>
            <Button type="submit">{vendor ? 'Save Changes' : 'Create Vendor'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
