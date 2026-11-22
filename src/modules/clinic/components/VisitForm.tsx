'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { visitSchema, type VisitInput } from '@/modules/clinic/schemas';

export function VisitForm({
  initialData,
  branches,
  customers,
  patients,
  doctors,
  onSubmit,
}: {
  initialData?: Partial<VisitInput>;
  branches: { id: string; code: string; name: string }[];
  customers: { id: string; full_name: string }[];
  patients: { id: string; name: string; customer_id: string }[];
  doctors: { id: string; full_name: string }[];
  onSubmit: (data: VisitInput) => void;
}) {
  const form = useForm<VisitInput>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      branch_id: initialData?.branch_id ?? '',
      customer_id: initialData?.customer_id ?? '',
      patient_id: initialData?.patient_id ?? '',
      complaint: initialData?.complaint ?? '',
      doctor_id: initialData?.doctor_id ?? undefined,
      service_type: initialData?.service_type ?? 'konsultasi',
      status: initialData?.status ?? 'terdaftar',
    },
  });

  const patientsForCustomer = customers.find((c) => c.id === form.getValues('customer_id'))
    ? patients.filter((p) => p.customer_id === form.getValues('customer_id'))
    : [];

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
          <option value="">Pilih hewan</option>
          {patientsForCustomer.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {form.formState.errors.patient_id && (
          <span className="text-sm text-red-600">{form.formState.errors.patient_id.message}</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="complaint">Keluhan</Label>
          <Input id="complaint" placeholder="Misal: muntah, diare, lesu" {...form.register('complaint')} />
          {form.formState.errors.complaint && (
            <span className="text-sm text-red-600">{form.formState.errors.complaint.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="service_type">Jenis Layanan</Label>
          <select id="service_type" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('service_type')}>
            <option value="konsultasi">Konsultasi</option>
            <option value="vaksinasi">Vaksinasi</option>
            <option value="operasi">Operasi</option>
            <option value="grooming">Grooming</option>
          </select>
          {form.formState.errors.service_type && (
            <span className="text-sm text-red-600">{form.formState.errors.service_type.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="doctor_id">Dokter</Label>
        <select id="doctor_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('doctor_id')}>
          <option value="">Tidak ditentukan</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name}
            </option>
          ))}
        </select>
        {form.formState.errors.doctor_id && (
          <span className="text-sm text-red-600">{form.formState.errors.doctor_id.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select id="status" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('status')}>
          <option value="terdaftar">Terdaftar</option>
          <option value="menunggu">Menunggu</option>
          <option value="diperiksa">Diperiksa</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>
        {form.formState.errors.status && (
          <span className="text-sm text-red-600">{form.formState.errors.status.message}</span>
        )}
      </div>
      <Button type="submit">Daftarkan Kunjungan</Button>
    </form>
  );
}
