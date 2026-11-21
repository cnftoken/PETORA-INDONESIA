export const metadata = {
  title: 'Portal Pemilik Hewan - PETORA',
  description: 'Portal pemilik hewan untuk melihat informasi hewan peliharaan',
};

export default function PortalLayout({
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
