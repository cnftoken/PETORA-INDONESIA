import { getVisitQueue } from '@/modules/clinic/queries';
import { updateVisitQueue } from '@/modules/clinic/actions';
import { VisitQueueFormWrapper } from '../components/VisitQueueFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

type QueueStatus = 'menunggu' | 'dipanggil' | 'lewati' | 'selesai' | 'dibatalkan';

export default async function QueuePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const branchId = (params?.branchId as string) ?? undefined;
  const status = (params?.status as string) ?? 'menunggu';
  const { data, count } = await getVisitQueue({ branchId, status });

  async function handleAction(queueId: string, newStatus: QueueStatus) {
    await updateVisitQueue(queueId, { status: newStatus });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Antrean Kunjungan</h1>
          <p className="text-muted-foreground">Daftar antrean per cabang, panggil atau lewati antrean.</p>
        </div>
        <Button>Tambah Antrean</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Antrean</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada antrean.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Nomor Antrean</th>
                      <th className="text-left font-medium">Nomor Kunjungan</th>
                      <th className="text-left font-medium">Pelanggan</th>
                      <th className="text-left font-medium">Hewan</th>
                      <th className="text-left font-medium">Status</th>
                      <th className="text-center font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((q: any) => (
                      <tr key={q.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">{q.queue_number}</td>
                        <td>{q.visits?.visit_number ?? '-'}</td>
                        <td className="text-muted-foreground">{q.visits?.customers?.full_name ?? '-'}</td>
                        <td>{q.visits?.patients?.name ?? '-'}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${q.status === 'dipanggil' ? 'bg-green-100 text-green-700' : q.status === 'selesai' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex justify-center gap-1">
                            {q.status === 'menunggu' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleAction(q.id, 'dipanggil')}
                                  className="h-8 px-2"
                                >
                                  Panggil
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(q.id, 'lewati')}
                                  className="h-8 px-2"
                                >
                                  Lewati
                                </Button>
                              </>
                            )}
                            {q.status === 'dipanggil' && (
                              <Button
                                size="sm"
                                onClick={() => handleAction(q.id, 'selesai')}
                                className="h-8 px-2"
                              >
                                Selesai
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">
                {count} data antrean
              </p>
            )}
          </div>
          <hr className="border-border my-4" />
          <VisitQueueFormWrapper visits={[]} />
        </CardContent>
      </Card>
    </div>
  );
}
