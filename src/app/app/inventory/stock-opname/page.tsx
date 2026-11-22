import { getStockOpnameSessions } from '@/modules/inventory/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function StockOpnamePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const branchId = (params?.branchId as string) ?? undefined;
  const status = (params?.status as string) ?? undefined;
  const { data, count } = await getStockOpnameSessions({ branchId, status });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Stock Opname</h1>
          <p className="text-muted-foreground">
            Sesi penghitungan fisik per cabang. Produk terkunci sampai sesi ditutup.
          </p>
        </div>
        <Button>Buka Sesi Opname</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Sesi Stock Opname</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada sesi stock opname.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Sesi</th>
                      <th className="text-left font-medium">Cabang</th>
                      <th className="text-left font-medium">Status</th>
                      <th className="text-right font-medium">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row: any) => (
                      <tr key={row.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">{row.id.slice(0, 8)}</td>
                        <td>{row.branches?.code ?? '-'}</td>
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
              <p className="text-xs text-muted-foreground">{count} sesi stock opname</p>
            )}
          </div>
          <hr className="border-border my-4" />
          <div>
            <h2 className="text-17 font-semibold mb-4">Buka Sesi Opname Baru</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Pilih cabang untuk memulai sesi penghitungan fisik stok.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
