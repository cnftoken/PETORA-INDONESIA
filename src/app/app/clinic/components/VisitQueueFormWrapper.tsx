'use client';

import { useState } from 'react';
import { createVisitQueue } from '@/modules/clinic/actions';
import { VisitQueueForm } from '@/modules/clinic/components/VisitQueueForm';
import type { VisitQueueInput } from '@/modules/clinic/schemas';

export function VisitQueueFormWrapper({
  initialData,
  visits,
}: {
  initialData?: VisitQueueInput;
  visits: any[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: VisitQueueInput) {
    setError(null);
    setSuccess(null);
    try {
      await createVisitQueue(data);
      setSuccess('Antrean berhasil dibuat.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal membuat antrean.');
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
      <VisitQueueForm initialData={initialData} visits={visits} onSubmit={onSubmit} />
    </>
  );
}
