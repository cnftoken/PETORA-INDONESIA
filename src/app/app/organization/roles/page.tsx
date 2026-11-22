import { getRoles } from '@/modules/organization/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Role</h1>
          <p className="text-muted-foreground">Empat role tetap: Owner, Supervisor, Dokter, Staff.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {roles.length === 0 ? (
              <div className="text-muted-foreground">Belum ada role.</div>
            ) : (
              roles.map((role: any) => (
                <div key={role.id} className="flex items-center justify-between p-3 border rounded-md">
                  <span>{role.name} ({role.code})</span>
                  <span className="text-xs text-muted-foreground">{role.description ?? '-'}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
