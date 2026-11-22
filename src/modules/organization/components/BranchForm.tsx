'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { branchSchema, type BranchInput } from '@/modules/organization/schemas';

export function BranchForm({ initialData, onSubmit }: { initialData?: Partial<BranchInput>; onSubmit: (data: BranchInput) => void }) {
  const form = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      code: initialData?.code ?? '',
      name: initialData?.name ?? '',
      address: initialData?.address ?? '',
      phone: initialData?.phone ?? '',
      time_zone: initialData?.time_zone ?? 'Asia/Jakarta',
      is_active: initialData?.is_active ?? true,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Kode Cabang</Label>
          <Input id="code" placeholder="JKT01" {...form.register('code')} />
          {form.formState.errors.code && (
            <span className="text-sm text-red-600">{form.formState.errors.code.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nama Cabang</Label>
          <Input id="name" {...form.register('name')} />
          {form.formState.errors.name && (
            <span className="text-sm text-red-600">{form.formState.errors.name.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Alamat</Label>
        <Input id="address" {...form.register('address')} />
        {form.formState.errors.address && (
          <span className="text-sm text-red-600">{form.formState.errors.address.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telepon</Label>
        <Input id="phone" {...form.register('phone')} />
        {form.formState.errors.phone && (
          <span className="text-sm text-red-600">{form.formState.errors.phone.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="time_zone">Zona Waktu</Label>
        <Input id="time_zone" placeholder="Asia/Jakarta" {...form.register('time_zone')} />
        {form.formState.errors.time_zone && (
          <span className="text-sm text-red-600">{form.formState.errors.time_zone.message}</span>
        )}
        <p className="text-xs text-muted-foreground">Contoh: Asia/Jakarta, Asia/Makassar, Asia/Jayapura</p>
      </div>
      <Button type="submit">Simpan</Button>
    </form>
  );
}
