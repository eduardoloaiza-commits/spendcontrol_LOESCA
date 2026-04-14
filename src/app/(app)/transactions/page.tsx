import { Card } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/money";
import { TransactionForm } from "./TransactionForm";
import { format } from "date-fns";

export default async function TransactionsPage() {
  const { household } = await requireHousehold();
  const [txs, accounts, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { householdId: household.id },
      include: { category: true, finAccount: true },
      orderBy: { occurredAt: "desc" },
      take: 200,
    }),
    prisma.finAccount.findMany({ where: { householdId: household.id, archived: false } }),
    prisma.category.findMany({ where: { householdId: household.id } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Movimientos</h1>

      <Card>
        <div className="font-medium mb-4">Registrar movimiento</div>
        <TransactionForm accounts={accounts} categories={categories} />
      </Card>

      <Card>
        <ul className="divide-y divide-silver/60">
          {txs.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium">{t.description}</div>
                <div className="text-xs text-slate">
                  {format(t.occurredAt, "dd MMM")} · {t.finAccount.name} ·{" "}
                  {t.category?.name ?? "Sin categoría"} · {t.status}
                </div>
              </div>
              <div className={`amount font-medium ${t.amount < 0 ? "text-coral" : "text-mint"}`}>
                {formatCLP(t.amount)}
              </div>
            </li>
          ))}
          {txs.length === 0 && <li className="py-6 text-sm text-slate">Sin movimientos todavía.</li>}
        </ul>
      </Card>
    </div>
  );
}
