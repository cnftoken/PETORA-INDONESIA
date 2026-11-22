import { getCategories } from '@/modules/catalog/queries';
import { CategoryFormWrapper } from '../components/CategoryFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Kategori</h1>
          <p className="text-muted-foreground">Kelola kategori produk dan layanan.</p>
        </div>
        <Button>Tambah Kategori</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="text-muted-foreground">Belum ada kategori.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Nama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category: any) => (
                      <tr key={category.id} className="border-b border-border">
                        <td>{category.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <hr className="border-border my-4" />
          <CategoryFormWrapper />
        </CardContent>
      </Card>
    </div>
  );
}
