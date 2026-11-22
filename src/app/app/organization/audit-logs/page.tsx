import { getAuditLogs } from '@/modules/organization/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default async function AuditLogsPage() {
  const { data } = await getAuditLogs();
  const logs = data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Log Audit</h1>
          <p className="text-muted-foreground">Jejak perubahan data (hanya-baca).</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Perubahan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="text-muted-foreground">Belum ada log audit.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium">Waktu</th>
                      <th className="text-left font-medium">Aktor</th>
                      <th className="text-left font-medium">Entitas</th>
                      <th className="text-left font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: any) => (
                      <tr key={log.id} className="border-b border-border">
                        <td className="font-mono tabular-nums">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                        <td>{log.users?.full_name ?? 'Sistem'}</td>
                        <td>{log.entity}</td>
                        <td>{log.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
