import { getBranches } from '@/modules/organization/queries';
import { BranchForm } from '@/modules/organization/components/BranchForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { createBranch as createBranchAction } from '@/modules/organization/actions';

export default async function BranchesPage() {
  const branches = await getBranches();

  async function handleSubmit(data: { code: string; name: string; address?: string; phone?: string; time_zone: string; is_active: boolean }) {
    await createBranchAction(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Cabang</h1>
          <p className="text-muted-foreground">Kelola cabang, zona waktu, dan status aktif.</p>
        </div>
        <Button>Tambah Cabang</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {branches.length === 0 ? (
              <div className="text-muted-foreground">Belum ada cabang.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Kode</th>
                      <th className="text-left font-medium">Nama</th>
                      <th className="text-left font-medium">Zona Waktu</th>
                      <th className="text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((branch) => (
                      <tr key={branch.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">{branch.code}</td>
                        <td>{branch.name}</td>
                        <td>{branch.time_zone}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${branch.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {branch.is_active ? 'Aktif' : 'Nonaktif'}
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
          <BranchForm onSubmit={handleSubmit as any} />
        </CardContent>
      </Card>
    </div>
  );
}
