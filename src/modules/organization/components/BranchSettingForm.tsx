'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { z } from 'zod';

export function BranchSettingForm({
  initialData,
  onSubmit,
}: {
  initialData?: {
    vat_active?: boolean;
    vat_rate_basis_points?: number;
    vat_mode?: string;
    rounding_mode?: string;
    expiry_warning_days?: number;
  };
  onSubmit: (data: {
    vat_active: boolean;
    vat_rate_basis_points: number;
    vat_mode: 'exclusive' | 'inclusive';
    rounding_mode: 'none' | '100' | '500' | '1000';
    expiry_warning_days: number;
  }) => Promise<void> | void;
}) {
  const formSchema = z.object({
    vat_active: z.boolean().default(false),
    vat_rate_basis_points: z.number().int().min(0),
    vat_mode: z.enum(['exclusive', 'inclusive']),
    rounding_mode: z.enum(['none', '100', '500', '1000']),
    expiry_warning_days: z.number().int().min(1),
  });

  const form = useForm<{
    vat_active: boolean;
    vat_rate_basis_points: number;
    vat_mode: 'exclusive' | 'inclusive';
    rounding_mode: 'none' | '100' | '500' | '1000';
    expiry_warning_days: number;
  }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vat_active: initialData?.vat_active ?? false,
      vat_rate_basis_points: initialData?.vat_rate_basis_points ?? 0,
      vat_mode: (initialData?.vat_mode ?? 'exclusive') as 'exclusive' | 'inclusive',
      rounding_mode: (initialData?.rounding_mode ?? 'none') as 'none' | '100' | '500' | '1000',
      expiry_warning_days: initialData?.expiry_warning_days ?? 30,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <input type="checkbox" {...form.register('vat_active')} />
          Aktifkan PPN
        </Label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vat_rate_basis_points">Tarif PPN (basis poin, 1% = 100)</Label>
          <Input id="vat_rate_basis_points" type="number" {...form.register('vat_rate_basis_points')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vat_mode">Mode Harga</Label>
          <select id="vat_mode" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('vat_mode')}>
            <option value="exclusive">Belum termasuk pajak</option>
            <option value="inclusive">Sudah termasuk pajak</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rounding_mode">Pembulatan</Label>
        <select id="rounding_mode" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('rounding_mode')}>
          <option value="none">Tanpa pembulatan</option>
          <option value="100">Rp100 terdekat</option>
          <option value="500">Rp500 terdekat</option>
          <option value="1000">Rp1.000 terdekat</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="expiry_warning_days">Ambang peringatan kedaluwarsa (hari)</Label>
        <Input id="expiry_warning_days" type="number" {...form.register('expiry_warning_days')} />
      </div>
      <Button type="submit">Simpan Pengaturan</Button>
    </form>
  );
}
