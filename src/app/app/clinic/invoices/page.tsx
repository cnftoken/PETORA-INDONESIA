import { getInvoices } from '@/modules/clinic/queries';
import { InvoiceFormWrapper } from '../components/InvoiceFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const branchId = (params?.branchId as string) ?? undefined;
  const status = (params?.status as string) ?? undefined;
  const source = (params?.source as string) ?? undefined;
  const { data, count } = await getInvoices({ branchId, status, source });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Tagihan Terpadu</h1>
          <p className="text-muted-foreground">Kelola tagihan kunjungan, rawat inap, dan retail.</p>
        </div>
        <Button>Buat Tagihan</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada tagihan.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Nomor Tagihan</th>
                      <th className="text-left font-medium">Pelanggan</th>
                      <th className="text-left font-medium">Sumber</th>
                      <th className="text-right font-medium">Grand Total</th>
                      <th className="text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((invoice: any) => (
                      <tr key={invoice.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">{invoice.invoice_number}</td>
                        <td>{invoice.customers?.full_name ?? '-'}</td>
                        <td>{invoice.source}</td>
                        <td className="font-mono tabular-nums text-right">{invoice.grand_total.toLocaleString('id-ID')}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${invoice.status === 'lunas' ? 'bg-green-100 text-green-700' : invoice.status === 'void' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {invoice.status}
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
                {count} data tagihan
              </p>
            )}
          </div>
          <hr className="border-border my-4" />
          <InvoiceFormWrapper branches={[]} customers={[]} patients={[]} visits={[]} />
        </CardContent>
      </Card>
    </div>
  );
}
