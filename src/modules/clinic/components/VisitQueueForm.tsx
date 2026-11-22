'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { visitQueueSchema, type VisitQueueInput } from '@/modules/clinic/schemas';

export function VisitQueueForm({
  initialData,
  visits,
  onSubmit,
}: {
  initialData?: Partial<VisitQueueInput>;
  visits: { id: string; visit_number: string }[];
  onSubmit: (data: VisitQueueInput) => void;
}) {
  const form = useForm<VisitQueueInput>({
    resolver: zodResolver(visitQueueSchema),
    defaultValues: {
      visit_id: initialData?.visit_id ?? '',
      branch_id: initialData?.branch_id ?? '',
      queue_number: initialData?.queue_number ?? 1,
      status: initialData?.status ?? 'menunggu',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="visit_id">Kunjungan</Label>
          <select id="visit_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('visit_id')}>
            <option value="">Pilih kunjungan</option>
            {visits.map((v) => (
              <option key={v.id} value={v.id}>
                {v.visit_number}
              </option>
            ))}
          </select>
          {form.formState.errors.visit_id && (
            <span className="text-sm text-red-600">{form.formState.errors.visit_id.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="queue_number">Nomor Antrean</Label>
          <Input id="queue_number" type="number" {...form.register('queue_number')} />
          {form.formState.errors.queue_number && (
            <span className="text-sm text-red-600">{form.formState.errors.queue_number.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status Antrean</Label>
        <select id="status" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('status')}>
          <option value="menunggu">Menunggu</option>
          <option value="dipanggil">Dipanggil</option>
          <option value="lewati">Dilewati</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>
        {form.formState.errors.status && (
          <span className="text-sm text-red-600">{form.formState.errors.status.message}</span>
        )}
      </div>
      <Button type="submit">Masukkan Antrean</Button>
    </form>
  );
}
