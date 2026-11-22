'use client';

import { useState } from 'react';
import { assignUserToBranch } from '@/modules/organization/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';

export function BranchAssignmentForm({ users, branches }: { users: any[]; branches: any[] }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    try {
      const user_id = formData.get('user_id') as string;
      const branch_id = formData.get('branch_id') as string;
      const is_primary = formData.get('is_primary') === 'true';
      await assignUserToBranch({ user_id, branch_id, is_primary });
      setSuccess('Penugasan cabang berhasil disimpan.');
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan penugasan cabang.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Penugasan Cabang</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm mb-3">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm mb-3">
            {success}
          </div>
        )}
        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pengguna</label>
              <select name="user_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="">Pilih pengguna</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cabang</label>
              <select name="branch_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="">Pilih cabang</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_primary" defaultChecked />
                Cabang utama (aktif)
              </label>
            </div>
          </div>
          <button type="submit" className="bg-brand-teal text-white px-4 py-2 rounded-md hover:bg-brand-teal-hover transition-colors">
            Simpan
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
