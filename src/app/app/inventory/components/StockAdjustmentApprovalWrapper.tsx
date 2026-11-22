'use client';

import { useState } from 'react';
import { createStockAdjustment, requestApprovalStockAdjustment } from '@/modules/inventory/actions';
import { StockAdjustmentForm } from '@/modules/inventory/components/StockAdjustmentForm';
import type { StockAdjustmentInput } from '@/modules/inventory/schemas';

export function StockAdjustmentApprovalWrapper() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(data: StockAdjustmentInput) {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const adjustment = await createStockAdjustment(data);
      await requestApprovalStockAdjustment({ adjustment_id: adjustment.id });
      setSuccess('Penyesuaian stok berhasil diajukan dan menunggu persetujuan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal mengajukan penyesuaian stok.');
    } finally {
      setSubmitting(false);
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
      <StockAdjustmentForm
        initialData={{ type: 'add' }}
        onSubmit={onSubmit}
        submitting={submitting}
      />
    </>
  );
}
