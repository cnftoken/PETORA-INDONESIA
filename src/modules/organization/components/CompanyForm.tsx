'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { companySchema, type CompanyInput } from '@/modules/organization/schemas';

export function CompanyForm({ initialData, onSubmit }: { initialData?: Partial<CompanyInput>; onSubmit: (data: CompanyInput) => void }) {
  const form = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name ?? '',
      address: initialData?.address ?? '',
      phone: initialData?.phone ?? '',
      npwp: initialData?.npwp ?? '',
      logo_url: initialData?.logo_url ?? '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Perusahaan</Label>
          <Input id="name" {...form.register('name')} />
          {form.formState.errors.name && (
            <span className="text-sm text-red-600">{form.formState.errors.name.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="npwp">NPWP</Label>
          <Input id="npwp" placeholder="01.234.567.8-901.000" {...form.register('npwp')} />
          {form.formState.errors.npwp && (
            <span className="text-sm text-red-600">{form.formState.errors.npwp.message}</span>
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
      <Button type="submit">Simpan</Button>
    </form>
  );
}
