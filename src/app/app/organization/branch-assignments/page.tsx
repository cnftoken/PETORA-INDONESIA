import { getUsers, getBranches } from '@/modules/organization/queries';
import { BranchAssignmentForm } from '../components/BranchAssignmentForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function BranchAssignmentsPage() {
  const [users, branches] = await Promise.all([getUsers(), getBranches()]);

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
          <BranchAssignmentForm users={users} branches={branches} />
        </CardContent>
      </Card>
    </div>
  );
}
