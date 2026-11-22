'use client';

import { useState } from 'react';
import { createProduct } from '@/modules/catalog/actions';
import { ProductForm } from '@/modules/catalog/components/ProductForm';
import type { ProductInput } from '@/modules/catalog/schemas';

export function ProductFormWrapper({ initialData, categories }: { initialData?: ProductInput; categories: any[] }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: ProductInput) {
    setError(null);
    setSuccess(null);
    try {
      await createProduct(data);
      setSuccess('Produk berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan produk.');
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
      <ProductForm
        initialData={initialData}
        categories={categories}
        onSubmit={onSubmit}
      />
    </>
  );
}
