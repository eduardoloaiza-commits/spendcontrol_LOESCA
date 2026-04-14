import { Card } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { ReconcileRow } from "./ReconcileRow";

export default async function ReconcilePage() {
  const { household } = await requireHousehold();
  const [pending, accounts, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { householdId: household.id, status: "pending" },
      include: { rawEmail: true, finAccount: true, category: true },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.finAccount.findMany({ where: { householdId: household.id, archived: false } }),
    prisma.category.findMany({ where: { householdId: household.id } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conciliar</h1>
        <p className="text-slate text-sm mt-1">
          Movimientos detectados desde tu correo. Confirma, asigna cuenta y categoría, o ignóralos.
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <p className="text-sm text-slate">No hay movimientos pendientes. 🎉</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((t) => (
            <ReconcileRow key={t.id} tx={t as any} accounts={accounts} categories={categories} />
          ))}
        </div>
      )}
    </div>
  );
}
