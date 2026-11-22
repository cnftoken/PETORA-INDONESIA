'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/ui/components/button';
import {
  getMedicalAttachmentsAction,
  getMedicalAttachmentSignedUrl,
  deleteMedicalAttachment,
} from '@/modules/medical-records/actions';

export function MedicalAttachmentList({
  examinationId,
  onRefresh,
}: {
  examinationId: string;
  onRefresh?: () => void;
}) {
  const [attachments, setAttachments] = useState<Array<{
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    created_at: string;
    users?: { full_name: string | null };
  } | null>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAttachments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMedicalAttachmentsAction(examinationId);
      setAttachments(data);
    } catch (err: any) {
      setError(err.message ?? 'Gagal memuat lampiran.');
    } finally {
      setLoading(false);
    }
  }, [examinationId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleDownload = useCallback(
    async (id: string) => {
      try {
        const signedUrl = await getMedicalAttachmentSignedUrl(id);
        window.open(signedUrl, '_blank');
      } catch (err: any) {
        setError(err.message ?? 'Gagal membuat tautan unduhan.');
      }
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Hapus lampiran ini?')) return;
      try {
        await deleteMedicalAttachment(id);
        setAttachments((prev) => prev.filter((a) => a?.id !== id));
        onRefresh?.();
      } catch (err: any) {
        setError(err.message ?? 'Gagal menghapus lampiran.');
      }
    },
    [onRefresh]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-muted-foreground">
        Memuat lampiran...
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

  if (attachments.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">Belum ada lampiran.</div>
    );
  }

  return (
    <div className="space-y-3">
      <table className="w-full text-sm border border-border">
        <thead>
          <tr className="bg-muted border-b border-border">
            <th className="text-left px-3 py-2 text-xs font-medium">File</th>
            <th className="text-left px-3 py-2 text-xs font-medium">Tipe</th>
            <th className="text-left px-3 py-2 text-xs font-medium">Ukuran</th>
            <th className="text-left px-3 py-2 text-xs font-medium">Diunggah</th>
            <th className="text-left px-3 py-2 text-xs font-medium">Tanggal</th>
            <th className="text-right px-3 py-2 text-xs font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {attachments.map((attachment) => {
            if (!attachment) return null;
            const sizeKB = ((attachment.file_size ?? 0) / 1024).toFixed(1);
            const date = new Date(attachment.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            return (
              <tr key={attachment.id} className="border-b border-border">
                <td className="px-3 py-2">{attachment.file_name}</td>
                <td className="px-3 py-2">
                  {attachment.file_type === 'application/pdf' ? 'PDF' : 'Gambar'}
                </td>
                <td className="px-3 py-2 tabular-nums">{sizeKB} KB</td>
                <td className="px-3 py-2">{attachment.users?.full_name ?? '-'}</td>
                <td className="px-3 py-2">{date}</td>
                <td className="px-3 py-2 text-right space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(attachment.id)}
                    className="h-8 px-2 text-xs"
                  >
                    Unduh
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                    className="h-8 px-2 text-xs"
                  >
                    Hapus
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
