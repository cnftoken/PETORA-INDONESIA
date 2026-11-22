'use client';

import { useState } from 'react';
import { createPatient } from '@/modules/customers/actions';
import { PatientForm } from '@/modules/customers/components/PatientForm';
import type { PatientInput } from '@/modules/customers/schemas';

export function PatientFormWrapper({ initialData, customers }: { initialData?: PatientInput; customers: any[] }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: PatientInput) {
    setError(null);
    setSuccess(null);
    try {
      await createPatient(data);
      setSuccess('Hewan berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan hewan.');
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
      <PatientForm
        initialData={initialData}
        customers={customers}
        onSubmit={onSubmit}
      />
    </>
  );
}
