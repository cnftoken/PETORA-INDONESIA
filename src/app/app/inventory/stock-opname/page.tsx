import { getStockBalances } from '@/modules/inventory/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';

export default async function StockOpnamePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const branchId = (params?.branchId as string) ?? undefined;
  const { data, count } = await getStockBalances({ branchId });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Stock Opname</h1>
          <p className="text-muted-foreground">Verifikasi stok fisik dan catat selisih.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Stok untuk Opname</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada data stok.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">SKU</th>
                      <th className="text-left font-medium">Produk</th>
                      <th className="text-right font-medium">Stok Sistem</th>
                      <th className="text-right font-medium">Stok Fisik</th>
                      <th className="text-right font-medium">Selisih</th>
                      <th className="text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row: any) => {
                      const product = row.products;
                      const diff = 0; // placeholder - diisi saat input fisik
                      return (
                        <tr key={row.id} className="border-b border-border">
                          <td className="font-mono tabular-nums">{product?.sku ?? '-'}</td>
                          <td>{product?.name ?? '-'}</td>
                          <td className="font-mono tabular-nums text-right">{row.quantity}</td>
                          <td className="font-mono tabular-nums text-right">-</td>
                          <td className="font-mono tabular-nums text-right">{diff}</td>
                          <td>
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-gray-100 text-gray-700">
                              Belum diverifikasi
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">
                {count} data stok
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
