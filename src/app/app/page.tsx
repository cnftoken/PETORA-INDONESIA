export default function OperationalHome() {
  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Area Operasional</h1>
        <p className="mt-2 text-muted">Masuk melalui autentikasi operasional akan mengikuti role dan cabang aktif.</p>
        <a className="button-primary mt-6 inline-flex" href="/app/settings">Pengaturan organisasi</a>
      </section>
    </main>
  );
}
