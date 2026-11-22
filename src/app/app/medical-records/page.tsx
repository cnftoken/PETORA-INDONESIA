import { getMedicalEntries } from '@/modules/medical-records/queries';
import { MedicalEntryFormWrapper } from './components/MedicalEntryFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function MedicalRecordsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const visitId = (params?.visitId as string) ?? undefined;
  const doctorId = (params?.doctorId as string) ?? undefined;
  const { data, count } = await getMedicalEntries({ visitId, doctorId });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Rekam Medis</h1>
          <p className="text-muted-foreground">Entri medis terstruktur per kunjungan. Draft tersimpan otomatis.</p>
        </div>
        <Button>Entri Medis Baru</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Entri Medis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada entri medis.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Kunjungan</th>
                      <th className="text-left font-medium">Pelanggan</th>
                      <th className="text-left font-medium">Hewan</th>
                      <th className="text-left font-medium">Dokter</th>
                      <th className="text-left font-medium">Diagnosis</th>
                      <th className="text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row: any) => (
                      <tr key={row.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">{row.visits?.visit_number ?? '-'}</td>
                        <td>{row.visits?.customers?.full_name ?? '-'}</td>
                        <td>{row.visits?.patients?.name ?? '-'}</td>
                        <td>{row.users?.full_name ?? '-'}</td>
                        <td className="text-muted-foreground">{row.diagnosis ?? '-'}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${row.is_final ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {row.is_final ? 'Final' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">{count} data entri medis</p>
            )}
          </div>
          <hr className="border-border my-4" />
          <MedicalEntryFormWrapper />
        </CardContent>
      </Card>
    </div>
  );
}
