export const metadata = {
  title: 'PETORA - Klinik Hewan dan Pet Shop',
  description: 'Sistem operasional terintegrasi klinik hewan dan pet shop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
