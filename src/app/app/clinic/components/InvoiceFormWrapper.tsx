'use client';

import { useState } from 'react';
import { createInvoice } from '@/modules/clinic/actions';
import { InvoiceForm } from '@/modules/clinic/components/InvoiceForm';
import type { InvoiceInput } from '@/modules/clinic/schemas';

export function InvoiceFormWrapper({
  initialData,
  branches,
  customers,
  patients,
  visits,
}: {
  initialData?: InvoiceInput;
  branches: any[];
  customers: any[];
  patients: any[];
  visits: any[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: InvoiceInput) {
    setError(null);
    setSuccess(null);
    try {
      await createInvoice(data);
      setSuccess('Tagihan berhasil dibuat.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal membuat tagihan.');
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
      <InvoiceForm
        initialData={initialData}
        branches={branches}
        customers={customers}
        patients={patients}
        visits={visits}
        onSubmit={onSubmit}
      />
    </>
  );
}
