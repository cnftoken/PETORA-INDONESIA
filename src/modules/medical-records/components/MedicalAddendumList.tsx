'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMedicalAddendaAction } from '@/modules/medical-records/actions';

export function MedicalAddendumList({
  examinationId,
}: {
  examinationId: string;
}) {
  const [addenda, setAddenda] = useState<Array<{
    id: string;
    reason: string;
    anamnesis: string | null;
    physical_exam: string | null;
    diagnosis: string | null;
    treatment_plan: string | null;
    weight_kg: number | null;
    created_at: string;
    users?: { full_name: string | null };
  } | null>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAddenda = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMedicalAddendaAction(examinationId);
      setAddenda(data);
    } catch (err: any) {
      setError(err.message ?? 'Gagal memuat addendum.');
    } finally {
      setLoading(false);
    }
  }, [examinationId]);

  useEffect(() => {
    fetchAddenda();
  }, [fetchAddenda]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-muted-foreground">
        Memuat addendum...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
        {error}
      </div>
    );
  }

  if (addenda.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">Belum ada addendum.</div>
    );
  }

  return (
    <div className="space-y-3">
      <table className="w-full text-sm border border-border">
        <thead>
          <tr className="bg-muted border-b border-border">
            <th className="text-left px-3 py-2 text-xs font-medium">Tanggal</th>
            <th className="text-left px-3 py-2 text-xs font-medium">Penulis</th>
            <th className="text-left px-3 py-2 text-xs font-medium">Alasan</th>
            <th className="text-left px-3 py-2 text-xs font-medium">Perubahan</th>
          </tr>
        </thead>
        <tbody>
          {addenda.map((addendum) => {
            if (!addendum) return null;
            const date = new Date(addendum.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            const changes: string[] = [];
            if (addendum.anamnesis) changes.push('Anamnesis');
            if (addendum.physical_exam) changes.push('Pemeriksaan Fisik');
            if (addendum.diagnosis) changes.push('Diagnosis');
            if (addendum.treatment_plan) changes.push('Rencana Terapi');
            if (addendum.weight_kg !== null && addendum.weight_kg !== undefined) changes.push(`Berat ${addendum.weight_kg} kg`);
            return (
              <tr key={addendum.id} className="border-b border-border">
                <td className="px-3 py-2 font-mono tabular-nums text-xs">{date}</td>
                <td className="px-3 py-2 text-xs">{addendum.users?.full_name ?? '-'}</td>
                <td className="px-3 py-2 text-xs">{addendum.reason}</td>
                <td className="px-3 py-2 text-xs">
                  {changes.length > 0 ? changes.join(', ') : '(hanya catatan alasan)'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
