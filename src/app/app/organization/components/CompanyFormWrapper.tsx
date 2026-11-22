'use client';

import { useState } from 'react';
import { createCompany } from '@/modules/organization/actions';
import { CompanyForm } from '@/modules/organization/components/CompanyForm';

export function CompanyFormWrapper({ initialData }: { initialData?: any }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: {
    name: string;
    address?: string;
    phone?: string;
    npwp?: string;
    logo_url?: string;
  }) {
    setError(null);
    setSuccess(null);
    try {
      await createCompany(data);
      setSuccess('Perusahaan berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan perusahaan.');
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
      <CompanyForm initialData={initialData} onSubmit={onSubmit} />
    </>
  );
}
