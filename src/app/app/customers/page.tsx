import { getCustomers } from '@/modules/customers/queries';
import { CustomerFormWrapper } from './components/CustomerFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';

export default async function CustomersPage({
  searchParams,
}: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const search = (params?.search as string) ?? '';
  const { data, count } = await getCustomers({ search });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Pelanggan</h1>
          <p className="text-muted-foreground">Kelola data pelanggan (terpusat lintas cabang).</p>
        </div>
        <Button>Tambah Pelanggan</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                id="search"
                type="search"
                placeholder="Cari nama, telepon, atau email..."
                defaultValue={search}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button>Cari</Button>
            </div>
            {data.length === 0 ? (
              <div className="text-muted-foreground">Belum ada pelanggan.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Nama</th>
                      <th className="text-left font-medium">Telepon</th>
                      <th className="text-left font-medium">Email</th>
                      <th className="text-left font-medium">Alamat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((customer: any) => (
                      <tr key={customer.id} className="border-b border-border">
                        <td>{customer.full_name}</td>
                        <td className="text-muted-foreground">{customer.phone}</td>
                        <td className="text-muted-foreground">{customer.email ?? '-'}</td>
                        <td className="text-muted-foreground">{customer.address ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">
                {count} data pelanggan
              </p>
            )}
          </div>
          <hr className="border-border my-4" />
          <CustomerFormWrapper />
        </CardContent>
      </Card>
    </div>
  );
}
