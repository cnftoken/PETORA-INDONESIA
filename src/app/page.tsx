export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-5xl items-center px-6">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Sistem operasional klinik
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">PETORA</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Pengelolaan klinik hewan, pet shop, stok, keuangan, dan riwayat hewan dalam satu tempat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="button-primary" href="/app">Masuk operasional</a>
            <a className="button-secondary" href="/portal">Portal pemilik hewan</a>
          </div>
        </div>
      </section>
    </main>
  );
}
