import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function createCustomer(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const phone = String(formData.get("phone") ?? "").replace(/\D/g, "");
  if (phone.length < 8) throw new Error("Nomor telepon minimal 8 digit.");
  const phoneNormalized = phone.startsWith("62") ? `+${phone}` : `+62${phone.replace(/^0/, "")}`;
  const { error } = await supabase.from("customers").insert({
    name: String(formData.get("name")).trim(),
    phone_normalized: phoneNormalized,
    email: String(formData.get("email")).trim() || null,
    address: String(formData.get("address")).trim() || null,
    notes: String(formData.get("notes")).trim() || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app/customers");
}

async function createAnimal(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const age = formData.get("estimated_age_months");
  const birthDate = String(formData.get("birth_date") ?? "").trim();
  if (!birthDate && (!age || Number(age) < 0)) {
    throw new Error("Isi tanggal lahir atau perkiraan umur hewan.");
  }
  const { error } = await supabase.from("animals").insert({
    patient_number: String(formData.get("patient_number")).trim().toUpperCase(),
    owner_id: String(formData.get("owner_id")),
    name: String(formData.get("name")).trim(),
    species: String(formData.get("species")).trim(),
    breed: String(formData.get("breed")).trim() || null,
    sex: String(formData.get("sex")),
    sterilized: formData.get("sterilized") === "on",
    birth_date: birthDate || null,
    estimated_age_months: birthDate ? null : Number(age),
    color: String(formData.get("color")).trim() || null,
    markings: String(formData.get("markings")).trim() || null,
    microchip: String(formData.get("microchip")).trim() || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app/customers");
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();

  let customerQuery = supabase
    .from("customers")
    .select("id,name,phone_normalized,email,address,notes")
    .order("name");
  if (q.trim()) customerQuery = customerQuery.or(`name.ilike.%${q.trim()}%,phone_normalized.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`);

  const [{ data: customers }, { data: animals }] = await Promise.all([
    customerQuery.limit(100),
    supabase
      .from("animals")
      .select("id,patient_number,name,species,breed,sex,status,last_weight_grams,owner_id")
      .order("name")
      .limit(100),
  ]);

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent">M02 Pelanggan dan Hewan</p>
            <h1 className="mt-1 text-3xl font-semibold">Pelanggan dan hewan</h1>
          </div>
          <form className="flex gap-2" action="/app/customers">
            <input name="q" defaultValue={q} placeholder="Nama, telepon, atau email" className="min-h-11 w-64 max-w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3" />
            <button className="button-primary" type="submit">Cari</button>
          </form>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Pelanggan</h2>
              <div className="mt-4 divide-y divide-[var(--border)]">
                {(customers ?? []).map((customer) => (
                  <div key={customer.id} className="py-3 text-sm">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-muted">{customer.phone_normalized}{customer.email ? ` · ${customer.email}` : ""}</p>
                  </div>
                ))}
                {(!customers || customers.length === 0) && <p className="mt-4 text-sm text-muted">Tidak ada pelanggan ditemukan.</p>}
              </div>
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Hewan</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {(animals ?? []).map((animal) => (
                  <article key={animal.id} className="rounded-lg border border-[var(--border)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="font-semibold">{animal.name}</p><p className="text-sm text-muted">{animal.patient_number}</p></div>
                      <span className="text-xs">{animal.status === "active" ? "Aktif" : "Meninggal"}</span>
                    </div>
                    <p className="mt-3 text-sm">{animal.species}{animal.breed ? ` · ${animal.breed}` : ""}</p>
                    {animal.last_weight_grams !== null && <p className="mt-1 text-sm text-muted">{animal.last_weight_grams / 1000} kg terbaru</p>}
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Tambah pelanggan</h2>
              <form action={createCustomer} className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm">Nama<input name="name" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Telepon<input name="phone" required placeholder="08xxxxxxxxxx" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Email<input name="email" type="email" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Alamat<textarea name="address" rows={2} className="rounded-lg border border-[var(--border)] bg-background px-3 py-2" /></label>
                <label className="grid gap-1 text-sm">Catatan<textarea name="notes" rows={2} className="rounded-lg border border-[var(--border)] bg-background px-3 py-2" /></label>
                <button type="submit" className="button-primary">Simpan pelanggan</button>
              </form>
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Tambah hewan</h2>
              <form action={createAnimal} className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm">Nomor pasien<input name="patient_number" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Pemilik
                  <select name="owner_id" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3">
                    {(customers ?? []).map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">Nama<input name="name" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Jenis<input name="species" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Ras<input name="breed" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Kelamin
                  <select name="sex" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3">
                    <option value="male">Jantan</option>
                    <option value="female">Betina</option>
                    <option value="unknown">Tidak diketahui</option>
                  </select>
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm"><input name="sterilized" type="checkbox" />Sudah steril</label>
                <label className="grid gap-1 text-sm">Tanggal lahir<input name="birth_date" type="date" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Perkiraan umur (bulan)<input name="estimated_age_months" type="number" min="0" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Warna/ciri<input name="color" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Microchip<input name="microchip" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Ciri khusus<textarea name="markings" rows={2} className="rounded-lg border border-[var(--border)] bg-background px-3 py-2" /></label>
                <button type="submit" className="button-primary">Simpan hewan</button>
              </form>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
