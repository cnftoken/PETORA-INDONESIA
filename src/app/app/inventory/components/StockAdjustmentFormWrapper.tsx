'use client';

import { useState } from 'react';
import { adjustStock } from '@/modules/inventory/actions';
import { StockAdjustmentForm } from '@/modules/inventory/components/StockAdjustmentForm';
import type { StockAdjustmentInput } from '@/modules/inventory/schemas';

export function StockAdjustmentFormWrapper({ initialData }: { initialData?: StockAdjustmentInput }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: StockAdjustmentInput) {
    setError(null);
    setSuccess(null);
    try {
      await adjustStock(data);
      setSuccess('Penyesuaian stok berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan penyesuaian stok.');
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
      <StockAdjustmentForm initialData={initialData} onSubmit={onSubmit} />
    </>
  );
}
