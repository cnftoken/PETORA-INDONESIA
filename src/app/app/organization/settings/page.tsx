import { getBranchSettings } from '@/modules/organization/queries';
import { BranchSettingForm } from '@/modules/organization/components/BranchSettingForm';
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

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan PPN dan Pembulatan</CardTitle>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="text-muted-foreground">Belum ada pengaturan cabang.</div>
          ) : (
            <BranchSettingForm
              initialData={{
                vat_active: settings[0].vat_active,
                vat_rate_basis_points: settings[0].vat_rate_basis_points,
                vat_mode: settings[0].vat_mode,
                rounding_mode: settings[0].rounding_mode,
                expiry_warning_days: settings[0].expiry_warning_days,
              }}
              onSubmit={async () => {}}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
