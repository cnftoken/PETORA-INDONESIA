import { getStockLowAlerts, getStockExpiryAlerts } from '@/modules/inventory/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function StockAlertsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const branchId = (params?.branchId as string) ?? undefined;

  const [lowAlerts, expiryAlerts] = await Promise.all([
    getStockLowAlerts({ branchId }),
    getStockExpiryAlerts({ branchId }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-34 font-semibold tracking-tight">Peringatan Stok</h1>
        <p className="text-muted-foreground">
          Stok di bawah minimum dan batch kedaluwarsa dalam 30 hari.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stok Di Bawah Minimum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowAlerts.data.length === 0 ? (
              <div className="text-muted-foreground">Tidak ada stok di bawah minimum.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">SKU</th>
                      <th className="text-left font-medium">Produk</th>
                      <th className="text-right font-medium">Saldo</th>
                      <th className="text-right font-medium">Stok Minimum</th>
                      <th className="text-left font-medium">Selisih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowAlerts.data.map((row: any) => {
                      const product = row.products;
                      const available = row.quantity - row.reserved;
                      const selisih = product.min_stock - available;
                      return (
                        <tr key={row.id} className="border-b border-border text-red-600">
                          <td className="font-mono tabular-nums">{product?.sku ?? '-'}</td>
                          <td>{product?.name ?? '-'}</td>
                          <td className="font-mono tabular-nums text-right">{available}</td>
                          <td className="font-mono tabular-nums text-right">{product?.min_stock ?? 0}</td>
                          <td className="font-mono tabular-nums text-right">{selisih}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {lowAlerts.count !== undefined && (
              <p className="text-xs text-muted-foreground">{lowAlerts.count} peringatan stok minimum</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batch Kedaluwarsa (30 Hari)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expiryAlerts.data.length === 0 ? (
              <div className="text-muted-foreground">Tidak ada batch kedaluwarsa dalam 30 hari.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Batch</th>
                      <th className="text-left font-medium">Produk</th>
                      <th className="text-left font-medium">SKU</th>
                      <th className="text-right font-medium">Kuantitas</th>
                      <th className="text-left font-medium">Kedaluwarsa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiryAlerts.data.map((row: any) => {
                      const product = row.products;
                      const hari = Math.ceil(
                        (new Date(row.expiry_date).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return (
                        <tr key={row.id} className="border-b border-border text-orange-600">
                          <td className="font-mono tabular-nums">{row.batch_no ?? '-'}</td>
                          <td>{product?.name ?? '-'}</td>
                          <td className="font-mono tabular-nums">{product?.sku ?? '-'}</td>
                          <td className="font-mono tabular-nums text-right">{row.quantity}</td>
                          <td className="font-mono tabular-nums text-right">
                            {row.expiry_date} ({hari} hari lagi)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {expiryAlerts.count !== undefined && (
              <p className="text-xs text-muted-foreground">
                {expiryAlerts.count} batch kedaluwarsa
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button>Atur Batas Stok Minimum</Button>
        <Button variant="outline">Ekspor Peringatan</Button>
      </div>
    </div>
  );
}
