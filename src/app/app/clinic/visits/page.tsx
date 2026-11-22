import { getVisits } from '@/modules/clinic/queries';
import { VisitFormWrapper } from '../components/VisitFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';

export default async function VisitsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const branchId = (params?.branchId as string) ?? undefined;
  const status = (params?.status as string) ?? undefined;
  const search = (params?.search as string) ?? '';
  const { data, count } = await getVisits({ branchId, status, search });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Kunjungan Klinik</h1>
          <p className="text-muted-foreground">Kelola pendaftaran kunjungan dan status.</p>
        </div>
        <Button>Daftarkan Kunjungan</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kunjungan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                id="search"
                type="search"
                placeholder="Cari nama pelanggan atau nomor pasien..."
                defaultValue={search}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button>Cari</Button>
            </div>
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada kunjungan.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Nomor Kunjungan</th>
                      <th className="text-left font-medium">Pelanggan</th>
                      <th className="text-left font-medium">Hewan</th>
                      <th className="text-left font-medium">Jenis Layanan</th>
                      <th className="text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((visit: any) => (
                      <tr key={visit.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">{visit.visit_number}</td>
                        <td>{visit.customers?.full_name ?? '-'}</td>
                        <td>{visit.patients?.name ?? '-'}</td>
                        <td>{visit.service_type}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${visit.status === 'selesai' ? 'bg-green-100 text-green-700' : visit.status === 'dibatalkan' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            {visit.status}
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
                {count} data kunjungan
              </p>
            )}
          </div>
          <hr className="border-border my-4" />
          <VisitFormWrapper branches={[]} customers={[]} patients={[]} doctors={[]} />
        </CardContent>
      </Card>
    </div>
  );
}
