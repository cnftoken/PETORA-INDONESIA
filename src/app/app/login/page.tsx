import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function signIn(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 10) {
    throw new Error("Email dan kata sandi minimal 10 karakter wajib diisi.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Email atau kata sandi tidak sesuai.");

  const { data: user } = await supabase
    .from("users")
    .select("account_type,active")
    .eq("id", data.user.id)
    .single();

  if (!user?.active || user.account_type !== "operational") {
    await supabase.auth.signOut();
    throw new Error("Akun ini bukan akun operasional aktif.");
  }

  redirect("/app");
}

export default function OperationalLoginPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <section className="mx-auto max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">PETORA</p>
        <h1 className="mt-2 text-2xl font-semibold">Masuk operasional</h1>
        <form action={signIn} className="mt-6 grid gap-4">
          <label className="grid gap-1 text-sm">
            Email
            <input name="email" type="email" required autoComplete="email" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" />
          </label>
          <label className="grid gap-1 text-sm">
            Kata sandi
            <input name="password" type="password" required minLength={10} autoComplete="current-password" className="min-h-11 rounded-lg border border-[var(--border)] bg-background px-3" />
          </label>
          <button type="submit" className="button-primary mt-2">Masuk</button>
        </form>
      </section>
    </main>
  );
}
