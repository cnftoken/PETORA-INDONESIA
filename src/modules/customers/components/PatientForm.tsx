'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { patientSchema, type PatientInput } from '@/modules/customers/schemas';

export function PatientForm({
  initialData,
  customers,
  onSubmit,
}: {
  initialData?: Partial<PatientInput>;
  customers: { id: string; full_name: string }[];
  onSubmit: (data: PatientInput) => void;
}) {
  const form = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      customer_id: initialData?.customer_id ?? '',
      patient_number: initialData?.patient_number ?? '',
      name: initialData?.name ?? '',
      species: initialData?.species ?? '',
      breed: initialData?.breed ?? '',
      gender: initialData?.gender ?? undefined,
      is_neutered: initialData?.is_neutered ?? false,
      birth_date: initialData?.birth_date ?? '',
      age_years: initialData?.age_years ?? undefined,
      color_marks: initialData?.color_marks ?? '',
      microchip: initialData?.microchip ?? '',
      photo_url: initialData?.photo_url ?? '',
      status: initialData?.status ?? 'aktif',
      owner_id: initialData?.owner_id ?? undefined,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer_id">Pemilik</Label>
          <select id="customer_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('customer_id')}>
            <option value="">Pilih pemilik</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
          {form.formState.errors.customer_id && (
            <span className="text-sm text-red-600">{form.formState.errors.customer_id.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="patient_number">Nomor Pasien</Label>
          <Input id="patient_number" placeholder="P001" {...form.register('patient_number')} />
          {form.formState.errors.patient_number && (
            <span className="text-sm text-red-600">{form.formState.errors.patient_number.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Hewan</Label>
          <Input id="name" {...form.register('name')} />
          {form.formState.errors.name && (
            <span className="text-sm text-red-600">{form.formState.errors.name.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="species">Jenis Hewan</Label>
          <Input id="species" placeholder="Kucing, Anjing, dll" {...form.register('species')} />
          {form.formState.errors.species && (
            <span className="text-sm text-red-600">{form.formState.errors.species.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="breed">Ras</Label>
          <Input id="breed" {...form.register('breed')} />
          {form.formState.errors.breed && (
            <span className="text-sm text-red-600">{form.formState.errors.breed.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Jenis Kelamin</Label>
          <select id="gender" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('gender')}>
            <option value="">Pilih</option>
            <option value="jantan">Jantan</option>
            <option value="betina">Betina</option>
          </select>
          {form.formState.errors.gender && (
            <span className="text-sm text-red-600">{form.formState.errors.gender.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('is_neutered')} />
            Steril
          </Label>
          {form.formState.errors.is_neutered && (
            <span className="text-sm text-red-600">{form.formState.errors.is_neutered.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="birth_date">Tanggal Lahir</Label>
          <Input id="birth_date" type="date" {...form.register('birth_date')} />
          {form.formState.errors.birth_date && (
            <span className="text-sm text-red-600">{form.formState.errors.birth_date.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age_years">Usia (Tahun)</Label>
          <Input id="age_years" type="number" {...form.register('age_years')} />
          {form.formState.errors.age_years && (
            <span className="text-sm text-red-600">{form.formState.errors.age_years.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="color_marks">Warna / Ciri Khas</Label>
          <Input id="color_marks" {...form.register('color_marks')} />
          {form.formState.errors.color_marks && (
            <span className="text-sm text-red-600">{form.formState.errors.color_marks.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="microchip">Microchip</Label>
          <Input id="microchip" {...form.register('microchip')} />
          {form.formState.errors.microchip && (
            <span className="text-sm text-red-600">{form.formState.errors.microchip.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="photo_url">Foto (URL)</Label>
          <Input id="photo_url" {...form.register('photo_url')} />
          {form.formState.errors.photo_url && (
            <span className="text-sm text-red-600">{form.formState.errors.photo_url.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select id="status" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('status')}>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
          <option value="meninggal">Meninggal</option>
        </select>
        {form.formState.errors.status && (
          <span className="text-sm text-red-600">{form.formState.errors.status.message}</span>
        )}
      </div>
      <Button type="submit">Simpan Hewan</Button>
    </form>
  );
}
