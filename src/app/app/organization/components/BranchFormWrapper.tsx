'use client';

import { useState } from 'react';
import { createBranch as createBranchAction } from '@/modules/organization/actions';
import { BranchForm } from '@/modules/organization/components/BranchForm';

export function BranchFormWrapper() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: {
    code: string;
    name: string;
    address?: string;
    phone?: string;
    time_zone: string;
    is_active: boolean;
  }) {
    setError(null);
    setSuccess(null);
    try {
      await createBranchAction(data);
      setSuccess('Cabang berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan cabang.');
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
      <BranchForm onSubmit={onSubmit} />
    </>
  );
}
