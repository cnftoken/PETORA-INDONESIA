import Link from 'next/link';

export default function OrganizationIndexPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-34 font-semibold tracking-tight">Organisasi dan Akses</h1>
      <p className="text-muted-foreground">Kelola perusahaan, cabang, pengguna, role, dan permission.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[['Perusahaan', '/app/organization/company'], ['Cabang', '/app/organization/branches'], ['Pengguna', '/app/organization/users'], ['Role', '/app/organization/roles'], ['Permission', '/app/organization/permissions'], ['Pengaturan', '/app/organization/settings'], ['Log Audit', '/app/organization/audit-logs']].map(([title, href]) => (
          <a key={href} href={href} className="block p-4 border rounded-card hover:border-brand-teal transition-colors">
            <h3 className="text-17 font-medium">{title}</h3>
          </a>
        ))}
      </div>
    </div>
  );
}
