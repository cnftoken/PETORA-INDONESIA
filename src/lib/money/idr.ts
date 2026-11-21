export function formatRupiah(value: number): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
  return formatted.replace(/\u00a0/g, "").replace("Rp ", "Rp");
}
