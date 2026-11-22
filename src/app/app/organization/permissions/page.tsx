import { getPermissions } from '@/modules/organization/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';

export default async function PermissionsPage() {
  const permissions = await getPermissions();

  const groups = permissions.reduce((acc: Record<string, any[]>, p: any) => {
    if (!acc[p.group_name]) acc[p.group_name] = [];
    acc[p.group_name].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Permission</h1>
          <p className="text-muted-foreground">Permission per kelompok sesuai matriks akses.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Permission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(groups).map(([groupName, perms]) => (
              <div key={groupName} className="space-y-2">
                <h3 className="text-15 font-semibold">{groupName}</h3>
                <div className="flex flex-wrap gap-2">
                  {perms.map((p: any) => (
                    <span key={p.permission_key} className="inline-flex items-center rounded-md border border-input bg-background px-2.5 py-1 text-xs">
                      {p.permission_key}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
