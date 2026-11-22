'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { Textarea } from '@/ui/components/textarea';
import { medicalEntrySchema, type MedicalEntryInput } from '@/modules/medical-records/schemas';

export function MedicalEntryForm({
  initialData,
  onSubmit,
}: {
  initialData?: Partial<MedicalEntryInput>;
  onSubmit: (data: MedicalEntryInput) => void;
}) {
  const form = useForm<MedicalEntryInput>({
    resolver: zodResolver(medicalEntrySchema),
    defaultValues: {
      visit_id: initialData?.visit_id ?? '',
      doctor_id: initialData?.doctor_id ?? '',
      anamnesis: initialData?.anamnesis ?? '',
      physical_exam: initialData?.physical_exam ?? '',
      diagnosis: initialData?.diagnosis ?? '',
      treatment_plan: initialData?.treatment_plan ?? '',
      weight_kg: initialData?.weight_kg ?? undefined,
      is_final: initialData?.is_final ?? false,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="visit_id">Kunjungan</Label>
          <select
            id="visit_id"
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register('visit_id')}
          >
            <option value="">Pilih kunjungan</option>
          </select>
          {form.formState.errors.visit_id && (
            <span className="text-sm text-red-600">{form.formState.errors.visit_id.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="doctor_id">Dokter</Label>
          <select
            id="doctor_id"
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register('doctor_id')}
          >
            <option value="">Pilih dokter</option>
          </select>
          {form.formState.errors.doctor_id && (
            <span className="text-sm text-red-600">{form.formState.errors.doctor_id.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="anamnesis">Anamnesis</Label>
        <Textarea id="anamnesis" placeholder="Keluhan dan riwayat penyakit" {...form.register('anamnesis')} />
        {form.formState.errors.anamnesis && (
          <span className="text-sm text-red-600">{form.formState.errors.anamnesis.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="physical_exam">Pemeriksaan Fisik</Label>
        <Textarea id="physical_exam" placeholder="Hasil pemeriksaan fisik" {...form.register('physical_exam')} />
        {form.formState.errors.physical_exam && (
          <span className="text-sm text-red-600">{form.formState.errors.physical_exam.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Input id="diagnosis" placeholder="Diagnosis" {...form.register('diagnosis')} />
        {form.formState.errors.diagnosis && (
          <span className="text-sm text-red-600">{form.formState.errors.diagnosis.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="treatment_plan">Rencana Terapi</Label>
        <Textarea id="treatment_plan" placeholder="Rencana penanganan" {...form.register('treatment_plan')} />
        {form.formState.errors.treatment_plan && (
          <span className="text-sm text-red-600">{form.formState.errors.treatment_plan.message}</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight_kg">Berat Badan (kg)</Label>
          <Input id="weight_kg" type="number" step="0.1" {...form.register('weight_kg')} />
          {form.formState.errors.weight_kg && (
            <span className="text-sm text-red-600">{form.formState.errors.weight_kg.message}</span>
          )}
        </div>
      </div>
      <Button type="submit">Simpan Entri Medis</Button>
    </form>
  );
}
