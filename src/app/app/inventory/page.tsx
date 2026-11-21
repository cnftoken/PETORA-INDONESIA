import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function receiveStock(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const quantity = Number(formData.get("quantity"));
  const price = Number(formData.get("purchase_price"));
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("Jumlah penerimaan harus bilangan bulat positif.");
  if (!Number.isInteger(price) || price < 0) throw new Error("Harga beli harus bilangan bulat Rupiah.");

  const { error } = await supabase.rpc("receive_stock", {
    p_branch_id: String(formData.get("branch_id")),
    p_product_id: String(formData.get("product_id")),
    p_batch_number: String(formData.get("batch_number")).trim(),
    p_expiry_date: String(formData.get("expiry_date")).trim() || null,
    p_quantity: quantity,
    p_purchase_price: price,
    p_source_type: "manual_receipt",
    p_source_id: crypto.randomUUID(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app/inventory");
}

async function submitAdjustment(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const quantityDelta = Number(formData.get("quantity_delta"));
  if (!Number.isInteger(quantityDelta) || quantityDelta === 0) {
    throw new Error("Selisih penyesuaian harus bilangan bulat selain nol.");
  }
  const { error } = await supabase.from("stock_adjustments").insert({
    branch_id: String(formData.get("branch_id")),
    product_id: String(formData.get("product_id")),
    quantity_delta: quantityDelta,
    reason: String(formData.get("reason")).trim(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app/inventory");
}

export default async function InventoryPage() {
  const supabase = await createClient();
  const [
    { data: branches },
    { data: products },
    { data: batches },
    { data: movements },
    { data: adjustments },
  ] = await Promise.all([
    supabase.from("branches").select("id,code,name").eq("active", true).order("code"),
    supabase.from("products").select("id,sku,name,minimum_stock,tracked_by_batch,tracked_by_expiry").eq("active", true).order("name"),
    supabase.from("stock_batches").select("id,branch_id,product_id,batch_number,expiry_date,quantity").order("expiry_date", { ascending: true, nullsFirst: false }),
    supabase.from("stock_movements").select("id,branch_id,product_id,movement_type,quantity_delta,running_balance,source_type,source_id,reason,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("stock_adjustments").select("id,branch_id,product_id,quantity_delta,reason,status,created_at").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-accent">M08 Inventori</p>
          <h1 className="mt-1 text-3xl font-semibold">Stok, batch, dan mutasi</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Saldo dan batch</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted"><tr><th className="py-2">Produk</th><th>Batch</th><th>Cabang</th><th>Kedaluwarsa</th><th className="text-right">Saldo</th></tr></thead>
                  <tbody>
                    {(batches ?? []).map((batch) => {
                      const product = products?.find((item) => item.id === batch.product_id);
                      const branch = branches?.find((item) => item.id === batch.branch_id);
                      return (
                        <tr key={batch.id} className="border-t border-[var(--border)]">
                          <td className="py-3 font-medium">{product?.name ?? "Produk"}</td>
                          <td>{batch.batch_number}</td>
                          <td>{branch?.code ?? "-"}</td>
                          <td>{batch.expiry_date ? new Date(`${batch.expiry_date}T00:00:00`).toLocaleDateString("id-ID") : "-"}</td>
                          <td className="text-right tabular-nums">{batch.quantity}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {(!batches || batches.length === 0) && <p className="mt-4 text-sm text-muted">Belum ada batch stok.</p>}
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Kartu stok</h2>
              <div className="mt-4 divide-y divide-[var(--border)]">
                {(movements ?? []).map((movement) => {
                  const product = products?.find((item) => item.id === movement.product_id);
                  const branch = branches?.find((item) => item.id === movement.branch_id);
                  return (
                    <div key={movement.id} className="grid grid-cols-[1fr_auto] gap-3 py-3 text-sm">
                      <div><p className="font-medium">{product?.name ?? "Produk"} · {branch?.code ?? "-"}</p><p className="text-muted">{movement.movement_type} · {movement.source_type} · {movement.source_id}</p></div>
                      <div className="text-right"><p className={movement.quantity_delta >= 0 ? "font-semibold text-green-700" : "font-semibold text-red-700"}>{movement.quantity_delta >= 0 ? "+" : ""}{movement.quantity_delta}</p><p className="text-muted tabular-nums">Saldo {movement.running_balance}</p></div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Pengajuan penyesuaian</h2>
              <div className="mt-4 divide-y divide-[var(--border)]">
                {(adjustments ?? []).map((adjustment) => (
                  <div key={adjustment.id} className="flex justify-between py-3 text-sm">
                    <div><p>{adjustment.reason}</p><p className="text-muted">{adjustment.quantity_delta > 0 ? "+" : ""}{adjustment.quantity_delta}</p></div>
                    <span>{adjustment.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Terima stok</h2>
              <form action={receiveStock} className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm">Cabang
                  <select name="branch_id" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3">
                    {(branches ?? []).map((branch) => <option key={branch.id} value={branch.id}>{branch.code} · {branch.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">Produk
                  <select name="product_id" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3">
                    {(products ?? []).map((product) => <option key={product.id} value={product.id}>{product.sku} · {product.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">Nomor batch<input name="batch_number" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Kedaluwarsa<input name="expiry_date" type="date" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Jumlah<input name="quantity" type="number" min="1" step="1" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3 text-right tabular-nums" /></label>
                <label className="grid gap-1 text-sm">Harga beli<input name="purchase_price" type="number" min="0" step="1" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3 text-right tabular-nums" /></label>
                <button type="submit" className="button-primary">Terima stok</button>
              </form>
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold">Ajukan penyesuaian</h2>
              <form action={submitAdjustment} className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm">Cabang
                  <select name="branch_id" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3">
                    {(branches ?? []).map((branch) => <option key={branch.id} value={branch.id}>{branch.code}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">Produk
                  <select name="product_id" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3">
                    {(products ?? []).map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">Selisih (+/-)<input name="quantity_delta" type="number" step="1" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" /></label>
                <label className="grid gap-1 text-sm">Alasan
                  <select name="reason" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3">
                    <option>Rusak</option><option>Hilang</option><option>Kedaluwarsa dibuang</option><option>Lainnya</option>
                  </select>
                </label>
                <button type="submit" className="button-primary">Ajukan penyesuaian</button>
              </form>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
