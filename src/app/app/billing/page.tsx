import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function createInvoice(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").insert({
    branch_id: String(formData.get("branch_id")),
    customer_id: String(formData.get("customer_id") || "") || null,
    source_type: "manual",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app/billing");
}

async function addItem(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const qty = Number(formData.get("quantity"));
  const price = Number(formData.get("unit_price"));
  const { error } = await supabase.from("invoice_items").insert({
    invoice_id: String(formData.get("invoice_id")),
    description: String(formData.get("description")).trim(),
    quantity: qty,
    unit_price: price,
    line_total: qty * price,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app/billing");
}

async function finalizeInvoice(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.rpc("finalize_invoice", { p_invoice_id: String(formData.get("invoice_id")) });
  if (error) throw new Error(error.message);
  revalidatePath("/app/billing");
}

async function recordPayment(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const amount = Number(formData.get("amount"));
  const { error } = await supabase.rpc("record_payment", {
    p_invoice_id: String(formData.get("invoice_id")),
    p_method: String(formData.get("method")),
    p_amount: amount,
    p_reference: String(formData.get("reference") || "").trim() || null,
    p_cash_received: formData.get("cash_received") ? Number(formData.get("cash_received")) : null,
    p_idempotency_key: crypto.randomUUID(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app/billing");
}

export default async function BillingPage() {
  const supabase = await createClient();
  const [{ data: invoices }, { data: branches }, { data: customers }] = await Promise.all([
    supabase.from("invoices").select("id,number,status,grand_total,paid_total,created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("branches").select("id,code,name").eq("active", true).order("code"),
    supabase.from("customers").select("id,full_name").order("full_name").limit(100),
  ]);
  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <section className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-semibold">Tagihan</h1>
        <form action={createInvoice} className="flex flex-wrap gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <select name="branch_id" required className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3">
            {(branches ?? []).map((b) => <option key={b.id} value={b.id}>{b.code}</option>)}
          </select>
          <select name="customer_id" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3">
            <option value="">Tanpa pelanggan</option>
            {(customers ?? []).map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
          <button type="submit" className="button-primary">Buat draft</button>
        </form>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="p-3">Nomor</th><th>Status</th><th className="text-right">Total</th><th className="text-right">Dibayar</th><th className="p-3">Aksi</th></tr></thead>
            <tbody>
              {(invoices ?? []).map((inv) => (
                <tr key={inv.id} className="border-t border-[var(--border)]">
                  <td className="p-3">{inv.number ?? "DRAFT"}</td>
                  <td className="p-3">{inv.status}</td>
                  <td className="p-3 text-right tabular-nums">{inv.grand_total}</td>
                  <td className="p-3 text-right tabular-nums">{inv.paid_total}</td>
                  <td className="p-3">
                    {inv.status === "draft" && (
                      <form action={addItem} className="flex gap-2">
                        <input type="hidden" name="invoice_id" value={inv.id} />
                        <input name="description" placeholder="Deskripsi" required className="min-h-9 rounded border border-[var(--border)] bg-background px-2" />
                        <input name="quantity" type="number" min="1" defaultValue="1" required className="min-h-9 w-16 rounded border border-[var(--border)] bg-background px-2" />
                        <input name="unit_price" type="number" min="0" required className="min-h-9 w-24 rounded border border-[var(--border)] bg-background px-2" />
                        <button type="submit" className="button-secondary">Tambah</button>
                      </form>
                    )}
                    {inv.status === "draft" && (
                      <form action={finalizeInvoice} className="mt-2">
                        <input type="hidden" name="invoice_id" value={inv.id} />
                        <button type="submit" className="button-primary">Finalisasi</button>
                      </form>
                    )}
                    {inv.status !== "draft" && inv.status !== "paid" && (
                      <form action={recordPayment} className="mt-2 flex gap-2">
                        <input type="hidden" name="invoice_id" value={inv.id} />
                        <select name="method" className="min-h-9 rounded border border-[var(--border)] bg-background px-2">
                          <option value="cash">Tunai</option><option value="transfer">Transfer</option><option value="qris">QRIS</option><option value="card">Kartu</option>
                        </select>
                        <input name="amount" type="number" min="1" required className="min-h-9 w-24 rounded border border-[var(--border)] bg-background px-2" />
                        <input name="reference" placeholder="Ref" className="min-h-9 w-24 rounded border border-[var(--border)] bg-background px-2" />
                        <input name="cash_received" type="number" placeholder="Diterima" className="min-h-9 w-24 rounded border border-[var(--border)] bg-background px-2" />
                        <button type="submit" className="button-primary">Bayar</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
