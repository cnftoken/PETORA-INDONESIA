import { getUsers, getBranches } from '@/modules/organization/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { assignUserToBranch } from '@/modules/organization/actions';

export default async function BranchAssignmentsPage() {
  const [users, branches] = await Promise.all([getUsers(), getBranches()]);

  async function handleSubmit(data: { user_id: string; branch_id: string; is_primary: boolean }) {
    await assignUserToBranch(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Penugasan Cabang</h1>
          <p className="text-muted-foreground">Tugaskan pengguna ke cabang dan tentukan cabang aktif.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Penugasan Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={async (e: any) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            await handleSubmit({
              user_id: formData.get('user_id') as string,
              branch_id: formData.get('branch_id') as string,
              is_primary: formData.get('is_primary') === 'true',
            });
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pengguna</label>
                <select name="user_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  <option value="">Pilih pengguna</option>
                  {users.map((u: any) => `<option value="${u.id}">${u.full_name} (${u.email})</option>`).join('')}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cabang</label>
                <select name="branch_id" className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  <option value="">Pilih cabang</option>
                  {branches.map((b: any) => `<option value="${b.id}">${b.code} - ${b.name}</option>`).join('')}
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_primary" defaultChecked />
                  Cabang utama (aktif)
                </label>
              </div>
            </div>
            <button type="submit" className="Button bg-brand-teal text-white px-4 py-2 rounded-md">Simpan</button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
