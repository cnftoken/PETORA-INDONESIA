import { getCompanies } from '@/modules/organization/queries';
import { CompanyForm } from '@/modules/organization/components/CompanyForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { createCompany } from '@/modules/organization/actions';

export default async function CompanyPage() {
  const companies = await getCompanies();

  async function handleSubmit(data: { name: string; address?: string; phone?: string; npwp?: string; logo_url?: string }) {
    await createCompany(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-34 font-semibold tracking-tight">Perusahaan</h1>
          <p className="text-muted-foreground">Kelola profil perusahaan dan setup awal.</p>
        </div>
        <Button>Tambah Perusahaan</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil Perusahaan</CardTitle>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-muted-foreground">Belum ada perusahaan. Tambahkan perusahaan pertama.</div>
          ) : (
            <CompanyForm
              initialData={companies[0]}
              onSubmit={handleSubmit as any}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
