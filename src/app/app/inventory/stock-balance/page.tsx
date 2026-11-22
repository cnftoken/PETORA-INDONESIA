import { getStockBalances } from '@/modules/inventory/queries';
import { StockAdjustmentFormWrapper } from '../components/StockAdjustmentFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function StockBalancePage({
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
          <h1 className="text-34 font-semibold tracking-tight">Saldo Stok</h1>
          <p className="text-muted-foreground">Kelola saldo stok per cabang per produk.</p>
        </div>
        <Button>Penyesuaian Stok</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Saldo Stok</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada saldo stok.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">SKU</th>
                      <th className="text-left font-medium">Produk</th>
                      <th className="text-right font-medium">Saldo</th>
                      <th className="text-right font-medium">Disisihkan</th>
                      <th className="text-right font-medium">Tersedia</th>
                      <th className="text-left font-medium">Stok Minimum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row: any) => {
                      const product = row.products;
                      const available = row.quantity - row.reserved;
                      return (
                        <tr key={row.id} className="border-b border-border">
                          <td className="font-mono tabular-nums">{product?.sku ?? '-'}</td>
                          <td>{product?.name ?? '-'}</td>
                          <td className="font-mono tabular-nums text-right">{row.quantity}</td>
                          <td className="font-mono tabular-nums text-right">{row.reserved}</td>
                          <td className={`font-mono tabular-nums text-right ${available < 0 ? 'text-red-600' : ''}`}>
                            {available}
                          </td>
                          <td className="font-mono tabular-nums text-right">{product?.min_stock ?? 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">
                {count} data saldo stok
              </p>
            )}
          </div>
          <hr className="border-border my-4" />
          <StockAdjustmentFormWrapper />
        </CardContent>
      </Card>
    </div>
  );
}
