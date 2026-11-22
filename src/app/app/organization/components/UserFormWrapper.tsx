'use client';

import { useState } from 'react';
import { createUser } from '@/modules/organization/actions';
import { UserForm } from '@/modules/organization/components/UserForm';

export function UserFormWrapper({ roles }: { roles: any[] }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(data: {
    email: string;
    full_name: string;
    phone?: string;
    is_active: boolean;
    role_id: string;
  }) {
    setError(null);
    setSuccess(null);
    try {
      await createUser(data);
      setSuccess('Pengguna berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan pengguna.');
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
      <UserForm roles={roles} onSubmit={onSubmit} />
    </>
  );
}
