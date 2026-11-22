import { getProducts, getCategories } from '@/modules/catalog/queries';
import { ProductFormWrapper } from '../components/ProductFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Produk</h1>
          <p className="text-muted-foreground">Kelola produk, SKU, harga, dan status pajak per item.</p>
        </div>
        <Button>Tambah Produk</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="text-muted-foreground">Belum ada produk.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">SKU</th>
                      <th className="text-left font-medium">Nama</th>
                      <th className="text-left font-medium">Kategori</th>
                      <th className="text-right font-medium">Harga Jual</th>
                      <th className="text-left font-medium">Satuan</th>
                      <th className="text-left font-medium">Batch</th>
                      <th className="text-left font-medium">Pajak</th>
                      <th className="text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any) => (
                      <tr key={product.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">{product.sku}</td>
                        <td>{product.name}</td>
                        <td className="text-muted-foreground">{product.categories?.name ?? '-'}</td>
                        <td className="font-mono tabular-nums text-right">{product.sale_price.toLocaleString('id-ID')}</td>
                        <td>{product.unit}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${product.is_batch ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {product.is_batch ? 'Ya' : 'Tidak'}
                          </span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${product.is_taxable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {product.is_taxable ? 'Ya' : 'Tidak'}
                          </span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.is_active ? 'Aktif' : 'Nonaktif'}
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
          <ProductFormWrapper categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
