'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { customerSchema, type CustomerInput } from '@/modules/customers/schemas';

export function CustomerForm({ initialData, onSubmit }: { initialData?: Partial<CustomerInput>; onSubmit: (data: CustomerInput) => void }) {
  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: initialData?.full_name ?? '',
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      address: initialData?.address ?? '',
      notes: initialData?.notes ?? '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nama Lengkap</Label>
          <Input id="full_name" {...form.register('full_name')} />
          {form.formState.errors.full_name && (
            <span className="text-sm text-red-600">{form.formState.errors.full_name.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Nomor Telepon</Label>
          <Input id="phone" placeholder="081234567890" {...form.register('phone')} />
          {form.formState.errors.phone && (
            <span className="text-sm text-red-600">{form.formState.errors.phone.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nama@contoh.com" {...form.register('email')} />
          {form.formState.errors.email && (
            <span className="text-sm text-red-600">{form.formState.errors.email.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Alamat</Label>
          <Input id="address" {...form.register('address')} />
          {form.formState.errors.address && (
            <span className="text-sm text-red-600">{form.formState.errors.address.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <Input id="notes" {...form.register('notes')} />
        {form.formState.errors.notes && (
          <span className="text-sm text-red-600">{form.formState.errors.notes.message}</span>
        )}
      </div>
      <Button type="submit">Simpan Pelanggan</Button>
    </form>
  );
}
