import { Card, CardTitle } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/money";
import { startOfMonth } from "date-fns";

export default async function Dashboard() {
  const { household } = await requireHousehold();
  const from = startOfMonth(new Date());
  const txs = await prisma.transaction.findMany({
    where: { householdId: household.id, occurredAt: { gte: from }, status: "confirmed" },
    include: { category: true, finAccount: true },
    orderBy: { occurredAt: "desc" },
  });

  const ingresos = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const gastos = txs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const neto = ingresos + gastos;

  const porCategoria: Record<string, number> = {};
  for (const t of txs) {
    if (t.amount >= 0) continue;
    const key = t.category?.name ?? "Sin categoría";
    porCategoria[key] = (porCategoria[key] ?? 0) + Math.abs(t.amount);
  }
  const top = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const pendientes = await prisma.transaction.count({
    where: { householdId: household.id, status: "pending" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resumen del mes</h1>
        <p className="text-slate text-sm mt-1">{household.name}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardTitle>Ingresos</CardTitle>
          <div className="amount text-3xl font-semibold text-mint">{formatCLP(ingresos)}</div>
        </Card>
        <Card>
          <CardTitle>Gastos</CardTitle>
          <div className="amount text-3xl font-semibold text-coral">{formatCLP(gastos)}</div>
        </Card>
        <Card>
          <CardTitle>Neto</CardTitle>
          <div className="amount text-3xl font-semibold">{formatCLP(neto)}</div>
        </Card>
      </div>

      {pendientes > 0 && (
        <Card className="border-coral/30 bg-coral/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Tienes {pendientes} movimientos por conciliar</div>
              <div className="text-sm text-slate">Revisa los gastos detectados desde tu correo.</div>
            </div>
            <a href="/reconcile" className="text-sm font-medium underline">Conciliar ahora</a>
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Top categorías de gasto</CardTitle>
        {top.length === 0 ? (
          <p className="text-sm text-slate">Aún no hay gastos este mes.</p>
        ) : (
          <ul className="divide-y divide-silver/60">
            {top.map(([name, amt]) => (
              <li key={name} className="flex items-center justify-between py-3">
                <span className="text-sm">{name}</span>
                <span className="amount font-medium">{formatCLP(-amt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>Últimos movimientos</CardTitle>
        <ul className="divide-y divide-silver/60">
          {txs.slice(0, 8).map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium">{t.description}</div>
                <div className="text-xs text-slate">
                  {t.finAccount.name} · {t.category?.name ?? "Sin categoría"}
                </div>
              </div>
              <div className={`amount font-medium ${t.amount < 0 ? "text-coral" : "text-mint"}`}>
                {formatCLP(t.amount)}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
