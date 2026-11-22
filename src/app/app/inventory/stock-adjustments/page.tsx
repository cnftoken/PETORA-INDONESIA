import { getStockAdjustments } from '@/modules/inventory/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { StockAdjustmentApprovalWrapper } from '../components/StockAdjustmentApprovalWrapper';

export default async function StockAdjustmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const branchId = (params?.branchId as string) ?? undefined;
  const status = (params?.status as string) ?? undefined;
  const { data, count } = await getStockAdjustments({ branchId, status });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Penyesuaian Stok</h1>
          <p className="text-muted-foreground">
            Koreksi stok dengan alasan. Gudang ajukan, Supervisor/Owner setujui.
          </p>
        </div>
        <Button>Ajukan Penyesuaian</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Penyesuaian Stok</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada penyesuaian stok.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Referensi</th>
                      <th className="text-left font-medium">Cabang</th>
                      <th className="text-left font-medium">Produk</th>
                      <th className="text-left font-medium">Jenis</th>
                      <th className="text-right font-medium">Kuantitas</th>
                      <th className="text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row: any) => (
                      <tr key={row.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">{row.id.slice(0, 8)}</td>
                        <td>{row.branches?.code ?? '-'}</td>
                        <td>{row.products?.name ?? '-'}</td>
                        <td className="font-mono tabular-nums">{row.type ?? '-'}</td>
                        <td className="font-mono tabular-nums text-right">{row.quantity}</td>
                        <td className="font-mono tabular-nums">{row.status ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">{count} data penyesuaian stok</p>
            )}
          </div>
          <hr className="border-border my-4" />
          <StockAdjustmentApprovalWrapper />
        </CardContent>
      </Card>
    </div>
  );
}
