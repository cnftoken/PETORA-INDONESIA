import { getStockMutations } from '@/modules/inventory/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';

export default async function StockMutationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const branchId = (params?.branchId as string) ?? undefined;
  const { data, count } = await getStockMutations({ branchId });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Kartu Stok</h1>
          <p className="text-muted-foreground">Riwayat mutasi stok (masuk, keluar, retur, penyesuaian).</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Mutasi Stok</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada mutasi stok.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Tanggal</th>
                      <th className="text-left font-medium">Produk</th>
                      <th className="text-left font-medium">Tipe</th>
                      <th className="text-right font-medium">Kuantitas</th>
                      <th className="text-left font-medium">Referensi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row: any) => (
                      <tr key={row.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">
                          {new Date(row.created_at).toLocaleString('id-ID')}
                        </td>
                        <td>{row.products?.name ?? '-'}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${row.mutation_type === 'in' ? 'bg-green-100 text-green-700' : row.mutation_type === 'out' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            {row.mutation_type}
                          </span>
                        </td>
                        <td className="font-mono tabular-nums text-right">
                          {row.mutation_type === 'in' || row.mutation_type === 'return' ? '+' : ''}{row.quantity}
                        </td>
                        <td className="text-muted-foreground">{row.reference ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">
                {count} data mutasi
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
