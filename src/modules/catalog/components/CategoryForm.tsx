'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { categorySchema, type CategoryInput } from '@/modules/catalog/schemas';

export function CategoryForm({ initialData, onSubmit }: { initialData?: Partial<CategoryInput>; onSubmit: (data: CategoryInput) => void }) {
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Kategori</Label>
        <Input id="name" {...form.register('name')} />
        {form.formState.errors.name && (
          <span className="text-sm text-red-600">{form.formState.errors.name.message}</span>
        )}
      </div>
      <Button type="submit">Simpan</Button>
    </form>
  );
}
