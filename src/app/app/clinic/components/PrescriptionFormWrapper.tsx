'use client';

import { useState } from 'react';
import { createPrescription } from '@/modules/clinic/actions';
import { PrescriptionForm } from '@/modules/clinic/components/PrescriptionForm';
import type { PrescriptionInput } from '@/modules/clinic/schemas';

export function PrescriptionFormWrapper({
  initialData,
  examinations,
  products,
  branchId,
}: {
  initialData?: PrescriptionInput;
  examinations: any[];
  products: any[];
  branchId?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: PrescriptionInput) {
    setError(null);
    setSuccess(null);
    try {
      await createPrescription(data);
      setSuccess('Resep berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan resep.');
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
      <PrescriptionForm
        initialData={initialData}
        examinations={examinations}
        products={products}
        branchId={branchId}
        onSubmit={onSubmit}
      />
    </>
  );
}
