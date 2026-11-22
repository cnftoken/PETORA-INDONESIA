'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { invoiceSchema, type InvoiceInput } from '@/modules/clinic/schemas';

export function InvoiceForm({
  initialData,
  branches,
  customers,
  patients,
  visits,
  onSubmit,
}: {
  initialData?: Partial<InvoiceInput>;
  branches: { id: string; code: string; name: string }[];
  customers: { id: string; full_name: string }[];
  patients: { id: string; name: string; customer_id: string }[];
  visits: { id: string; visit_number: string }[];
  onSubmit: (data: InvoiceInput) => void;
}) {
  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      branch_id: initialData?.branch_id ?? '',
      customer_id: initialData?.customer_id ?? '',
      patient_id: initialData?.patient_id ?? undefined,
      visit_id: initialData?.visit_id ?? undefined,
      source: initialData?.source ?? 'kunjungan',
      subtotal: initialData?.subtotal ?? 0,
      vat_amount: initialData?.vat_amount ?? 0,
      rounding_amount: initialData?.rounding_amount ?? 0,
      grand_total: initialData?.grand_total ?? 0,
      status: initialData?.status ?? 'belum_lunas',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="branch_id">Cabang</Label>
          <select id="branch_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('branch_id')}>
            <option value="">Pilih cabang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>
          {form.formState.errors.branch_id && (
            <span className="text-sm text-red-600">{form.formState.errors.branch_id.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_id">Pelanggan</Label>
          <select id="customer_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('customer_id')}>
            <option value="">Pilih pelanggan</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
          {form.formState.errors.customer_id && (
            <span className="text-sm text-red-600">{form.formState.errors.customer_id.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="patient_id">Hewan</Label>
        <select id="patient_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('patient_id')}>
          <option value="">Tidak ada</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {form.formState.errors.patient_id && (
          <span className="text-sm text-red-600">{form.formState.errors.patient_id.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="visit_id">Kunjungan</Label>
        <select id="visit_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('visit_id')}>
          <option value="">Tidak ada</option>
          {visits.map((v) => (
            <option key={v.id} value={v.id}>
              {v.visit_number}
            </option>
          ))}
        </select>
        {form.formState.errors.visit_id && (
          <span className="text-sm text-red-600">{form.formState.errors.visit_id.message}</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">Sumber Tagihan</Label>
          <select id="source" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('source')}>
            <option value="kunjungan">Kunjungan Klinik</option>
            <option value="rawat_inap">Rawat Inap</option>
            <option value="retail">Retail Pet Shop</option>
          </select>
          {form.formState.errors.source && (
            <span className="text-sm text-red-600">{form.formState.errors.source.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('status')}>
            <option value="belum_lunas">Belum Lunas</option>
            <option value="sebagian_lunas">Sebagian Lunas</option>
            <option value="lunas">Lunas</option>
            <option value="void">Void</option>
          </select>
          {form.formState.errors.status && (
            <span className="text-sm text-red-600">{form.formState.errors.status.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subtotal">Subtotal</Label>
          <Input id="subtotal" type="number" {...form.register('subtotal')} />
          {form.formState.errors.subtotal && (
            <span className="text-sm text-red-600">{form.formState.errors.subtotal.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="vat_amount">PPN</Label>
          <Input id="vat_amount" type="number" {...form.register('vat_amount')} />
          {form.formState.errors.vat_amount && (
            <span className="text-sm text-red-600">{form.formState.errors.vat_amount.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rounding_amount">Pembulatan</Label>
          <Input id="rounding_amount" type="number" {...form.register('rounding_amount')} />
          {form.formState.errors.rounding_amount && (
            <span className="text-sm text-red-600">{form.formState.errors.rounding_amount.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="grand_total">Grand Total</Label>
          <Input id="grand_total" type="number" {...form.register('grand_total')} />
          {form.formState.errors.grand_total && (
            <span className="text-sm text-red-600">{form.formState.errors.grand_total.message}</span>
          )}
        </div>
      </div>
      <Button type="submit">Simpan Tagihan</Button>
    </form>
  );
}
