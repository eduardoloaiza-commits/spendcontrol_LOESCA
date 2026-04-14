// Montos enteros (sin decimales) para CLP. Para otras monedas se escalará por 100.
export function formatCLP(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return sign + "$" + abs.toLocaleString("es-CL");
}

export function parseMoneyInput(s: string): number {
  const clean = s.replace(/[^0-9-]/g, "");
  return clean ? parseInt(clean, 10) : 0;
}
