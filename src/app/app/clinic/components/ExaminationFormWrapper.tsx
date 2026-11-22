'use client';

import { useState } from 'react';
import { createExamination } from '@/modules/clinic/actions';
import { ExaminationForm } from '@/modules/clinic/components/ExaminationForm';
import type { ExaminationInput } from '@/modules/clinic/schemas';

export function ExaminationFormWrapper({
  initialData,
  visits,
  doctors,
}: {
  initialData?: ExaminationInput;
  visits: any[];
  doctors: any[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: ExaminationInput) {
    setError(null);
    setSuccess(null);
    try {
      await createExamination(data);
      setSuccess('Pemeriksaan berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan pemeriksaan.');
    }
  }

  return (
    <>
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">
          {success}
        </div>
      )}
      <ExaminationForm
        initialData={initialData}
        visits={visits}
        doctors={doctors}
        onSubmit={onSubmit}
      />
    </>
  );
}
