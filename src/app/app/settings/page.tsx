import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function createBranch(formData: FormData) {
  "use server";
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();

  if (!/^[A-Z0-9]{2,5}$/.test(code) || !name || !timezone) {
    throw new Error("Kode cabang, nama, dan zona waktu wajib diisi.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("branches").insert({ code, name, timezone });
  if (error) throw new Error(error.message);
  revalidatePath("/app/settings");
}

export default async function OrganizationSettingsPage() {
  const supabase = await createClient();
  const [{ data: company }, { data: branches }] = await Promise.all([
    supabase.from("company").select("name,address,tax_id,vat_enabled,vat_basis_points,vat_included,rounding_increment,expiry_warning_days").limit(1).maybeSingle(),
    supabase.from("branches").select("code,name,timezone,active").order("code"),
  ]);

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-accent">M01 Organisasi dan Akses</p>
          <h1 className="mt-1 text-3xl font-semibold">Pengaturan organisasi</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-lg font-semibold">Profil perusahaan</h2>
            {company ? (
              <dl className="mt-4 grid gap-3 text-sm">
                <div><dt className="text-muted">Nama</dt><dd className="mt-1 font-medium">{company.name}</dd></div>
                <div><dt className="text-muted">Alamat</dt><dd className="mt-1">{company.address || "Belum diisi"}</dd></div>
                <div><dt className="text-muted">NPWP</dt><dd className="mt-1">{company.tax_id || "Belum diisi"}</dd></div>
                <div><dt className="text-muted">PPN</dt><dd className="mt-1">{company.vat_enabled ? `${company.vat_basis_points / 100}%` : "Tidak aktif"}</dd></div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted">Masuk sebagai Owner untuk mengelola profil perusahaan.</p>
            )}
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-lg font-semibold">Cabang</h2>
            <div className="mt-4 space-y-2">
              {(branches ?? []).map((branch) => (
                <div key={branch.code} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{branch.code} · {branch.name}</p>
                    <p className="text-muted">{branch.timezone}</p>
                  </div>
                  <span className="text-xs">{branch.active ? "Aktif" : "Nonaktif"}</span>
                </div>
              ))}
              {(!branches || branches.length === 0) && (
                <p className="text-sm text-muted">Belum ada cabang yang dapat dilihat.</p>
              )}
            </div>

            <form action={createBranch} className="mt-5 grid gap-3 border-t border-[var(--border)] pt-5">
              <label className="grid gap-1 text-sm">
                Kode cabang
                <input name="code" required maxLength={5} className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3 uppercase" />
              </label>
              <label className="grid gap-1 text-sm">
                Nama cabang
                <input name="name" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" />
              </label>
              <label className="grid gap-1 text-sm">
                Zona waktu
                <select name="timezone" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3">
                  <option value="Asia/Jakarta">WIB · Asia/Jakarta</option>
                  <option value="Asia/Makassar">WITA · Asia/Makassar</option>
                  <option value="Asia/Jayapura">WIT · Asia/Jayapura</option>
                </select>
              </label>
              <button className="button-primary mt-1" type="submit">Tambah cabang</button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
