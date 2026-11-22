import { getPatients, getCustomers } from '@/modules/customers/queries';
import { PatientFormWrapper } from './components/PatientFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';

export default async function PatientsPage({
  searchParams,
}: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const customerId = (params?.customerId as string) ?? undefined;
  const search = (params?.search as string) ?? '';
  const [{ data: customersData }, { data, count }] = await Promise.all([
    getCustomers(),
    getPatients({ customerId, search }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Hewan / Pasien</h1>
          <p className="text-muted-foreground">Kelola profil hewan (terpusat lintas cabang).</p>
        </div>
        <Button>Tambah Hewan</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Hewan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                id="search"
                type="search"
                placeholder="Cari nama, nomor pasien, atau jenis..."
                defaultValue={search}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button>Cari</Button>
            </div>
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada hewan.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Nomor Pasien</th>
                      <th className="text-left font-medium">Nama Hewan</th>
                      <th className="text-left font-medium">Pemilik</th>
                      <th className="text-left font-medium">Jenis</th>
                      <th className="text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((patient: any) => (
                      <tr key={patient.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">{patient.patient_number}</td>
                        <td>{patient.name}</td>
                        <td className="text-muted-foreground">{patient.customers?.full_name ?? '-'}</td>
                        <td>{patient.species}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${patient.status === 'aktif' ? 'bg-green-100 text-green-700' : patient.status === 'meninggal' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            {patient.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">
                {count} data hewan
              </p>
            )}
          </div>
          <hr className="border-border my-4" />
          <PatientFormWrapper customers={customersData} />
        </CardContent>
      </Card>
    </div>
  );
}
