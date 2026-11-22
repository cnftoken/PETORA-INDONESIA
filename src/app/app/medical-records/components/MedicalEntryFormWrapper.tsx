'use client';

import { useState } from 'react';
import { createMedicalEntry } from '@/modules/medical-records/actions';
import { MedicalEntryForm } from '@/modules/medical-records/components/MedicalEntryForm';
import type { MedicalEntryInput } from '@/modules/medical-records/schemas';

export function MedicalEntryFormWrapper({
  initialData,
}: {
  initialData?: MedicalEntryInput;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: MedicalEntryInput) {
    setError(null);
    setSuccess(null);
    try {
      await createMedicalEntry(data);
      setSuccess('Entri medis berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan entri medis.');
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
      <MedicalEntryForm initialData={initialData} onSubmit={onSubmit} />
    </>
  );
}
