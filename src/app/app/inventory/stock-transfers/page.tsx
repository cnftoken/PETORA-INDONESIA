import { getStockTransfers } from '@/modules/inventory/queries';
import { StockTransferFormWrapper } from '../components/StockTransferFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function StockTransfersPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const branchId = (params?.branchId as string) ?? undefined;
  const status = (params?.status as string) ?? undefined;
  const { data, count } = await getStockTransfers({ branchId, status });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Transfer Stok</h1>
          <p className="text-muted-foreground">
            Transfer stok antar cabang: draft → dikirim → diterima.
          </p>
        </div>
        <Button>Buat Transfer</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transfer Stok</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada transfer stok.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Referensi</th>
                      <th className="text-left font-medium">Cabang Asal</th>
                      <th className="text-left font-medium">Cabang Tujuan</th>
                      <th className="text-left font-medium">Status</th>
                      <th className="text-right font-medium">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row: any) => (
                      <tr key={row.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">{row.reference ?? '-'}</td>
                        <td>{row.branches?.code ?? '-'}</td>
                        <td>{row.destination_branch?.code ?? '-'}</td>
                        <td className="font-mono tabular-nums">{row.status ?? '-'}</td>
                        <td className="font-mono tabular-nums text-right">
                          {new Date(row.created_at ?? Date.now()).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">{count} data transfer stok</p>
            )}
          </div>
          <hr className="border-border my-4" />
          <StockTransferFormWrapper />
        </CardContent>
      </Card>
    </div>
  );
}
