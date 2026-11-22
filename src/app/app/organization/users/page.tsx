import { getUsers, getRoles } from '@/modules/organization/queries';
import { UserForm } from '@/modules/organization/components/UserForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { createUser } from '@/modules/organization/actions';

export default async function UsersPage() {
  const [users, roles] = await Promise.all([getUsers(), getRoles()]);

  async function handleSubmit(data: { email: string; full_name: string; phone?: string; is_active: boolean; role_id: string }) {
    await createUser(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Pengguna</h1>
          <p className="text-muted-foreground">Kelola pengguna, role, dan status aktif.</p>
        </div>
        <Button>Tambah Pengguna</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-muted-foreground">Belum ada pengguna.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Nama</th>
                      <th className="text-left font-medium">Email</th>
                      <th className="text-left font-medium">Role</th>
                      <th className="text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.id} className="border-b border-border">
                        <td>{user.full_name}</td>
                        <td className="text-muted-foreground">{user.email}</td>
                        <td>{user.role_id}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.is_active ? 'Aktif' : 'Nonaktif'}
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
          <UserForm roles={roles as any} onSubmit={handleSubmit as any} />
        </CardContent>
      </Card>
    </div>
  );
}
