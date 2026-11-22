import { getServices, getCategories } from '@/modules/catalog/queries';
import { ServiceFormWrapper } from '../components/ServiceFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([getServices(), getCategories()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Layanan</h1>
          <p className="text-muted-foreground">Kelola layanan klinis (konsultasi, vaksinasi, operasi) dan harga.</p>
        </div>
        <Button>Tambah Layanan</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Layanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.length === 0 ? (
              <div className="text-muted-foreground">Belum ada layanan.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Nama</th>
                      <th className="text-left font-medium">Kategori</th>
                      <th className="text-right font-medium">Harga</th>
                      <th className="text-left font-medium">Pelaksana</th>
                      <th className="text-left font-medium">Pajak</th>
                      <th className="text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service: any) => (
                      <tr key={service.id} className="border-b border-border">
                        <td>{service.name}</td>
                        <td className="text-muted-foreground">{service.categories?.name ?? '-'}</td>
                        <td className="font-mono tabular-nums text-right">{service.price.toLocaleString('id-ID')}</td>
                        <td>{service.executor}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${service.is_taxable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {service.is_taxable ? 'Ya' : 'Tidak'}
                          </span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {service.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <hr className="border-border my-4" />
          <ServiceFormWrapper categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
