'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { prescriptionSchema, type PrescriptionInput } from '@/modules/clinic/schemas';

export function PrescriptionForm({
  initialData,
  examinations,
  products,
  onSubmit,
}: {
  initialData?: Partial<PrescriptionInput>;
  examinations: { id: string }[];
  products: { id: string; sku: string; name: string }[];
  onSubmit: (data: PrescriptionInput) => void;
}) {
  const form = useForm<PrescriptionInput>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      examination_id: initialData?.examination_id ?? '',
      product_id: initialData?.product_id ?? undefined,
      medicine_name: initialData?.medicine_name ?? '',
      dosage: initialData?.dosage ?? '',
      usage_instruction: initialData?.usage_instruction ?? '',
      quantity: initialData?.quantity ?? 1,
      unit_price: initialData?.unit_price ?? 0,
      total_price: initialData?.total_price ?? 0,
      is_taxable: initialData?.is_taxable ?? true,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="examination_id">Pemeriksaan</Label>
          <select id="examination_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('examination_id')}>
            <option value="">Pilih pemeriksaan</option>
            {examinations.map((e) => (
              <option key={e.id} value={e.id}>
                Pemeriksaan {e.id.slice(0, 8)}
              </option>
            ))}
          </select>
          {form.formState.errors.examination_id && (
            <span className="text-sm text-red-600">{form.formState.errors.examination_id.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_id">Produk Obat</Label>
          <select id="product_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('product_id')}>
            <option value="">Pilih produk (opsional)</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} - {p.name}
              </option>
            ))}
          </select>
          {form.formState.errors.product_id && (
            <span className="text-sm text-red-600">{form.formState.errors.product_id.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="medicine_name">Nama Obat</Label>
        <Input id="medicine_name" {...form.register('medicine_name')} />
        {form.formState.errors.medicine_name && (
          <span className="text-sm text-red-600">{form.formState.errors.medicine_name.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="dosage">Dosis</Label>
        <Input id="dosage" placeholder="Misal: 1 tablet 2x sehari" {...form.register('dosage')} />
        {form.formState.errors.dosage && (
          <span className="text-sm text-red-600">{form.formState.errors.dosage.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="usage_instruction">Aturan Pakai</Label>
        <Input id="usage_instruction" placeholder="Misal: setelah makan" {...form.register('usage_instruction')} />
        {form.formState.errors.usage_instruction && (
          <span className="text-sm text-red-600">{form.formState.errors.usage_instruction.message}</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Kuantitas</Label>
          <Input id="quantity" type="number" {...form.register('quantity')} />
          {form.formState.errors.quantity && (
            <span className="text-sm text-red-600">{form.formState.errors.quantity.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit_price">Harga Satuan</Label>
          <Input id="unit_price" type="number" {...form.register('unit_price')} />
          {form.formState.errors.unit_price && (
            <span className="text-sm text-red-600">{form.formState.errors.unit_price.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="total_price">Total Harga</Label>
        <Input id="total_price" type="number" {...form.register('total_price')} />
        {form.formState.errors.total_price && (
          <span className="text-sm text-red-600">{form.formState.errors.total_price.message}</span>
        )}
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
      <Button type="submit">Simpan Resep</Button>
    </form>
  );
}
