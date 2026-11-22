'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { userSchema, type UserInput } from '@/modules/organization/schemas';

export function UserForm({
  initialData,
  roles,
  onSubmit,
}: {
  initialData?: Partial<UserInput>;
  roles: { id: string; code: string; name: string }[];
  onSubmit: (data: UserInput) => void;
}) {
  const form = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: initialData?.email ?? '',
      full_name: initialData?.full_name ?? '',
      phone: initialData?.phone ?? '',
      is_active: initialData?.is_active ?? true,
      role_id: initialData?.role_id ?? '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register('email')} />
          {form.formState.errors.email && (
            <span className="text-sm text-red-600">{form.formState.errors.email.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name">Nama Lengkap</Label>
          <Input id="full_name" {...form.register('full_name')} />
          {form.formState.errors.full_name && (
            <span className="text-sm text-red-600">{form.formState.errors.full_name.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telepon</Label>
        <Input id="phone" {...form.register('phone')} />
        {form.formState.errors.phone && (
          <span className="text-sm text-red-600">{form.formState.errors.phone.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="role_id">Role</Label>
        <select id="role_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('role_id')}>
          <option value="">Pilih role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} ({role.code})
            </option>
          ))}
        </select>
        {form.formState.errors.role_id && (
          <span className="text-sm text-red-600">{form.formState.errors.role_id.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <input type="checkbox" {...form.register('is_active')} />
          Aktif
        </Label>
        {form.formState.errors.is_active && (
          <span className="text-sm text-red-600">{form.formState.errors.is_active.message}</span>
        )}
      </div>
      <Button type="submit">Simpan</Button>
    </form>
  );
}
