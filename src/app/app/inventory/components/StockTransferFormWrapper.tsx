'use client';

import { useState } from 'react';
import { createStockTransfer } from '@/modules/inventory/actions';
import { StockTransferForm } from '@/modules/inventory/components/StockTransferForm';
import type { StockTransferInput } from '@/modules/inventory/schemas';

export function StockTransferFormWrapper({
  initialData,
}: {
  initialData?: StockTransferInput;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: StockTransferInput) {
    setError(null);
    setSuccess(null);
    try {
      await createStockTransfer(data);
      setSuccess('Transfer stok berhasil dibuat.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal membuat transfer stok.');
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
      <StockTransferForm initialData={initialData} onSubmit={onSubmit} />
    </>
  );
}
