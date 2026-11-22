'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { serviceSchema, type ServiceInput } from '@/modules/catalog/schemas';

export function ServiceForm({
  initialData,
  categories,
  onSubmit,
}: {
  initialData?: Partial<ServiceInput>;
  categories: { id: string; name: string }[];
  onSubmit: (data: ServiceInput) => void;
}) {
  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      category_id: initialData?.category_id ?? '',
      price: initialData?.price ?? 0,
      is_taxable: initialData?.is_taxable ?? true,
      executor: initialData?.executor ?? 'dokter',
      is_active: initialData?.is_active ?? true,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Layanan</Label>
          <Input id="name" placeholder="Konsultasi Umum" {...form.register('name')} />
          {form.formState.errors.name && (
            <span className="text-sm text-red-600">{form.formState.errors.name.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category_id">Kategori</Label>
          <select id="category_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('category_id')}>
            <option value="">Pilih kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {form.formState.errors.category_id && (
            <span className="text-sm text-red-600">{form.formState.errors.category_id.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Harga (Rupiah)</Label>
          <Input id="price" type="number" {...form.register('price')} />
          {form.formState.errors.price && (
            <span className="text-sm text-red-600">{form.formState.errors.price.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="executor">Pelaksana</Label>
          <select id="executor" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('executor')}>
            <option value="dokter">Dokter Hewan</option>
            <option value="perawat">Perawat</option>
            <option value="staff">Staff</option>
          </select>
          {form.formState.errors.executor && (
            <span className="text-sm text-red-600">{form.formState.errors.executor.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <input type="checkbox" {...form.register('is_taxable')} />
          Kena PPN
        </Label>
        {form.formState.errors.is_taxable && (
          <span className="text-sm text-red-600">{form.formState.errors.is_taxable.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <input type="checkbox" {...form.register('is_active')} />
          Aktif
        </Label>
        {form.formState.errors.is_active && (
          <span className="text-sm text-red-600">{form.formState.errors.is_active.message}</span>
        )}
      </div>
      <Button type="submit">Simpan Layanan</Button>
    </form>
  );
}
