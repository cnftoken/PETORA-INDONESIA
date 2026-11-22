'use client';

import { useState } from 'react';
import { updateBranchSetting } from '@/modules/organization/actions';
import { BranchSettingForm } from '@/modules/organization/components/BranchSettingForm';

export function BranchSettingFormWrapper({ initialData }: { initialData: any }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: {
    vat_active: boolean;
    vat_rate_basis_points: number;
    vat_mode: 'exclusive' | 'inclusive';
    rounding_mode: 'none' | '100' | '500' | '1000';
    expiry_warning_days: number;
  }) {
    setError(null);
    setSuccess(null);
    try {
      await updateBranchSetting({
        branch_id: initialData.branch_id,
        ...data,
      });
      setSuccess('Pengaturan berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan pengaturan.');
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
      <BranchSettingForm initialData={initialData} onSubmit={onSubmit} />
    </>
  );
}
