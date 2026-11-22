import { getBranchSettings } from '@/modules/organization/queries';
import { BranchSettingFormWrapper } from '../components/BranchSettingFormWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';

export default async function SettingsPage() {
  const settings = await getBranchSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Pengaturan Perusahaan</h1>
          <p className="text-muted-foreground">PPN, pembulatan, dan ambang peringatan kedaluwarsa per cabang.</p>
        </div>
      </div>

      {settings.length === 0 ? (
        <div className="text-muted-foreground">Belum ada pengaturan cabang.</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan PPN dan Pembulatan</CardTitle>
          </CardHeader>
          <CardContent>
            <BranchSettingFormWrapper initialData={settings[0]} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
