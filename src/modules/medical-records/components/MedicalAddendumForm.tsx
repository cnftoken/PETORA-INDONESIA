'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { Textarea } from '@/ui/components/textarea';
import { addMedicalAddendum } from '@/modules/medical-records/actions';
import { medicalAddendumSchema, type MedicalAddendumInput } from '@/modules/medical-records/schemas';

export function MedicalAddendumForm({
  examinationId,
  onAddSuccess,
}: {
  examinationId: string;
  onAddSuccess?: () => void;
}) {
  const form = useForm<MedicalAddendumInput>({
    resolver: zodResolver(medicalAddendumSchema),
    defaultValues: {
      examination_id: examinationId,
      reason: '',
      anamnesis: undefined,
      physical_exam: undefined,
      diagnosis: undefined,
      treatment_plan: undefined,
      weight_kg: undefined,
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(data: MedicalAddendumInput) {
    setError(null);
    setSubmitting(true);
    try {
      await addMedicalAddendum(data);
      form.reset({
        examination_id: examinationId,
        reason: '',
        anamnesis: undefined,
        physical_exam: undefined,
        diagnosis: undefined,
        treatment_plan: undefined,
        weight_kg: undefined,
      });
      onAddSuccess?.();
    } catch (err: any) {
      setError(err.message ?? 'Gagal menambahkan addendum.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reason">Alasan Addendum</Label>
        <Input
          id="reason"
          placeholder="Alasan perubahan atau catatan tambahan"
          {...form.register('reason')}
        />
        {form.formState.errors.reason && (
          <span className="text-sm text-red-600">{form.formState.errors.reason.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="anamnesis">Anamnesis</Label>
        <Textarea id="anamnesis" placeholder="Catatan anamnesis tambahan" {...form.register('anamnesis')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="physical_exam">Pemeriksaan Fisik</Label>
        <Textarea id="physical_exam" placeholder="Hasil pemeriksaan fisik tambahan" {...form.register('physical_exam')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Input id="diagnosis" placeholder="Diagnosis revisi" {...form.register('diagnosis')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="treatment_plan">Rencana Terapi</Label>
        <Textarea id="treatment_plan" placeholder="Rencana penanganan revisi" {...form.register('treatment_plan')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="weight_kg">Berat Badan (kg)</Label>
        <Input id="weight_kg" type="number" step="0.1" {...form.register('weight_kg')} />
      </div>
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Menambahkan...' : 'Tambah Addendum'}
      </Button>
    </form>
  );
}
