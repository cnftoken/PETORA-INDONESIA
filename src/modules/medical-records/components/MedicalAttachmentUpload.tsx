'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { uploadMedicalAttachment } from '@/modules/medical-records/actions';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

export function MedicalAttachmentUpload({
  examinationId,
  onUploadSuccess,
}: {
  examinationId: string;
  onUploadSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setUploading(true);
      try {
        const formData = new FormData(e.currentTarget);
        await uploadMedicalAttachment(formData);
        onUploadSuccess?.();
      } catch (err: any) {
        setError(err.message ?? 'Gagal mengunggah lampiran.');
      } finally {
        setUploading(false);
      }
    },
    [onUploadSuccess]
  );

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Tipe file harus JPG, PNG, atau PDF.';
    }
    if (file.size > MAX_SIZE) {
      return 'Ukuran file maksimal 10 MB.';
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Lampiran Medis</Label>
        <Input
          id="file"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const validationError = validateFile(file);
              if (validationError) {
                setError(validationError);
                e.target.value = '';
              } else {
                setError(null);
              }
            }
          }}
        />
        {error && (
          <span className="text-sm text-red-600">{error}</span>
        )}
      </div>
      <input type="hidden" name="examination_id" value={examinationId} />
      <Button
        type="submit"
        disabled={uploading}
        className="w-full"
      >
        {uploading ? 'Mengunggah...' : 'Unggah Lampiran'}
      </Button>
    </form>
  );
}
