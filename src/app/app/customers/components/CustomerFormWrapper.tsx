'use client';

import { useState } from 'react';
import { createCustomer } from '@/modules/customers/actions';
import { CustomerForm } from '@/modules/customers/components/CustomerForm';
import type { CustomerInput } from '@/modules/customers/schemas';

export function CustomerFormWrapper({ initialData }: { initialData?: CustomerInput }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: CustomerInput) {
    setError(null);
    setSuccess(null);
    try {
      await createCustomer(data);
      setSuccess('Pelanggan berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan pelanggan.');
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
      <CustomerForm initialData={initialData} onSubmit={onSubmit} />
    </>
  );
}
