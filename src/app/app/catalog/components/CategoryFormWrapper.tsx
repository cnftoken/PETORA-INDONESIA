'use client';

import { useState } from 'react';
import { createCategory } from '@/modules/catalog/actions';
import { CategoryForm } from '@/modules/catalog/components/CategoryForm';
import type { CategoryInput } from '@/modules/catalog/schemas';

export function CategoryFormWrapper({ initialData }: { initialData?: CategoryInput }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: CategoryInput) {
    setError(null);
    setSuccess(null);
    try {
      await createCategory(data);
      setSuccess('Kategori berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan kategori.');
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
      <CategoryForm initialData={initialData} onSubmit={onSubmit} />
    </>
  );
}
