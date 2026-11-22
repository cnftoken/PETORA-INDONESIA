'use client';

import { useState } from 'react';
import { createService } from '@/modules/catalog/actions';
import { ServiceForm } from '@/modules/catalog/components/ServiceForm';
import type { ServiceInput } from '@/modules/catalog/schemas';

export function ServiceFormWrapper({ initialData, categories }: { initialData?: ServiceInput; categories: any[] }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: ServiceInput) {
    setError(null);
    setSuccess(null);
    try {
      await createService(data);
      setSuccess('Layanan berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan layanan.');
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
      <ServiceForm
        initialData={initialData}
        categories={categories}
        onSubmit={onSubmit}
      />
    </>
  );
}
