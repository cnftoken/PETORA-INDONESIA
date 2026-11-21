import { createClient } from "@/lib/supabase/server";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase.from("invoices").select("id,number,status,grand_total,paid_total,created_at").order("created_at", { ascending: false }).limit(50);
  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold">Tagihan</h1>
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="p-3">Nomor</th><th>Status</th><th className="text-right">Total</th><th className="text-right">Dibayar</th></tr></thead>
            <tbody>
              {(invoices ?? []).map((inv) => (
                <tr key={inv.id} className="border-t border-[var(--border)]">
                  <td className="p-3">{inv.number ?? "DRAFT"}</td>
                  <td className="p-3">{inv.status}</td>
                  <td className="p-3 text-right tabular-nums">{inv.grand_total}</td>
                  <td className="p-3 text-right tabular-nums">{inv.paid_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
