import { getExaminations } from '@/modules/clinic/queries';
import { ExaminationFormWrapper } from '../components/ExaminationFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function ExaminationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const visitId = (params?.visitId as string) ?? undefined;
  const doctorId = (params?.doctorId as string) ?? undefined;
  const { data, count } = await getExaminations({ visitId, doctorId });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Pemeriksaan dan Tindakan</h1>
          <p className="text-muted-foreground">Catatan pemeriksaan dokter, diagnosis, dan rencana terapi.</p>
        </div>
        <Button>Tambah Pemeriksaan</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pemeriksaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada pemeriksaan.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Kunjungan</th>
                      <th className="text-left font-medium">Hewan</th>
                      <th className="text-left font-medium">Dokter</th>
                      <th className="text-left font-medium">Diagnosis</th>
                      <th className="text-left font-medium">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((exam: any) => (
                      <tr key={exam.id} className="border-b border-border">
                        <td>{exam.visits?.visit_number ?? '-'}</td>
                        <td>{exam.visits?.patients?.name ?? '-'}</td>
                        <td className="text-muted-foreground">{exam.doctor_id}</td>
                        <td>{exam.diagnosis ?? '-'}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${exam.is_final ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {exam.is_final ? 'Ya' : 'Tidak'}
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
                {count} data pemeriksaan
              </p>
            )}
          </div>
          <hr className="border-border my-4" />
          <ExaminationFormWrapper visits={[]} doctors={[]} />
        </CardContent>
      </Card>
    </div>
  );
}
