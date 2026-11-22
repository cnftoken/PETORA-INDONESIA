'use client';

import { useState } from 'react';
import { createVisit } from '@/modules/clinic/actions';
import { VisitForm } from '@/modules/clinic/components/VisitForm';
import type { VisitInput } from '@/modules/clinic/schemas';

export function VisitFormWrapper({
  initialData,
  branches,
  customers,
  patients,
  doctors,
}: {
  initialData?: VisitInput;
  branches: any[];
  customers: any[];
  patients: any[];
  doctors: any[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: VisitInput) {
    setError(null);
    setSuccess(null);
    try {
      await createVisit(data);
      setSuccess('Kunjungan berhasil didaftarkan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal mendaftarkan kunjungan.');
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
      <VisitForm
        initialData={initialData}
        branches={branches}
        customers={customers}
        patients={patients}
        doctors={doctors}
        onSubmit={onSubmit}
      />
    </>
  );
}
