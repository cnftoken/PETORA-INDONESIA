import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/money/idr";

async function createProduct(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const salePrice = Number(formData.get("sale_price"));
  if (!Number.isInteger(salePrice) || salePrice < 0) {
    throw new Error("Harga jual harus bilangan bulat Rupiah yang tidak negatif.");
  }
  const { error } = await supabase.from("products").insert({
    sku: String(formData.get("sku")).trim().toUpperCase(),
    name: String(formData.get("name")).trim(),
    unit: String(formData.get("unit")).trim(),
    sale_price: salePrice,
    barcode: String(formData.get("barcode")).trim() || null,
    tracked_by_batch: formData.get("tracked_by_batch") === "on",
    tracked_by_expiry: formData.get("tracked_by_expiry") === "on",
    taxable: formData.get("taxable") === "on",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app/catalog");
}

async function createService(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const price = Number(formData.get("price"));
  if (!Number.isInteger(price) || price < 0) {
    throw new Error("Harga layanan harus bilangan bulat Rupiah yang tidak negatif.");
  }
  const { error } = await supabase.from("services").insert({
    code: String(formData.get("code")).trim().toUpperCase(),
    name: String(formData.get("name")).trim(),
    price,
    performer: String(formData.get("performer")),
    taxable: formData.get("taxable") === "on",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app/catalog");
}

export default async function CatalogPage() {
  const supabase = await createClient();
  const [{ data: products }, { data: services }] = await Promise.all([
    supabase.from("products").select("sku,name,unit,sale_price,barcode,taxable,active,tracked_by_batch,tracked_by_expiry").order("name"),
    supabase.from("services").select("code,name,price,taxable,performer,active").order("name"),
  ]);

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-accent">M06 Katalog dan Harga</p>
          <h1 className="mt-1 text-3xl font-semibold">Produk dan layanan</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Produk</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted">
                    <tr><th className="py-2">SKU</th><th>Nama</th><th>Satuan</th><th className="text-right">Harga</th><th>Pajak</th></tr>
                  </thead>
                  <tbody>
                    {(products ?? []).map((product) => (
                      <tr key={product.sku} className="border-t border-[var(--border)]">
                        <td className="py-3 font-medium">{product.sku}</td>
                        <td>{product.name}</td>
                        <td>{product.unit}</td>
                        <td className="text-right tabular-nums">{formatRupiah(product.sale_price)}</td>
                        <td>{product.taxable ? "Kena PPN" : "Tidak kena PPN"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!products || products.length === 0) && <p className="mt-4 text-sm text-muted">Belum ada produk yang dapat dilihat.</p>}
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Layanan dan tindakan</h2>
              <div className="mt-4 grid gap-2">
                {(services ?? []).map((service) => (
                  <div key={service.code} className="grid grid-cols-[100px_1fr_auto] items-center gap-3 border-t border-[var(--border)] py-3 text-sm">
                    <span className="font-medium">{service.code}</span>
                    <div><p>{service.name}</p><p className="text-muted">{service.performer === "doctor" ? "Dokter" : "Perawat"}</p></div>
                    <strong className="tabular-nums">{formatRupiah(service.price)}</strong>
                  </div>
                ))}
                {(!services || services.length === 0) && <p className="text-sm text-muted">Belum ada layanan yang dapat dilihat.</p>}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Tambah produk</h2>
              <form action={createProduct} className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm">SKU<input name="sku" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Nama<input name="name" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Satuan<input name="unit" required defaultValue="pcs" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Harga jual<input name="sale_price" type="number" min="0" step="1" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3 text-right tabular-nums" /></label>
                <label className="grid gap-1 text-sm">Barcode<input name="barcode" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="flex min-h-11 items-center gap-2 text-sm"><input name="taxable" type="checkbox" />Kena PPN</label>
                <label className="flex min-h-11 items-center gap-2 text-sm"><input name="tracked_by_batch" type="checkbox" />Berbatch</label>
                <label className="flex min-h-11 items-center gap-2 text-sm"><input name="tracked_by_expiry" type="checkbox" />Berkedaluwarsa</label>
                <button type="submit" className="button-primary">Simpan produk</button>
              </form>
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Tambah layanan</h2>
              <form action={createService} className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm">Kode<input name="code" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Nama<input name="name" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Harga<input name="price" type="number" min="0" step="1" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3 text-right tabular-nums" /></label>
                <label className="grid gap-1 text-sm">Pelaksana
                  <select name="performer" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3">
                    <option value="doctor">Dokter</option>
                    <option value="nurse">Perawat</option>
                  </select>
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm"><input name="taxable" type="checkbox" />Kena PPN</label>
                <button type="submit" className="button-primary">Simpan layanan</button>
              </form>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
