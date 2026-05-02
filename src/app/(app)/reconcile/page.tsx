import { Card, Chip } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { ReconcileRow } from "./ReconcileRow";
import { PartyPopper } from "lucide-react";

export default async function ReconcilePage() {
  const { household } = await requireHousehold();
  const [pending, accounts, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { householdId: household.id, status: "pending" },
      include: { rawEmail: true, finAccount: true, category: true },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.finAccount.findMany({ where: { householdId: household.id, archived: false } }),
    prisma.category.findMany({
      where: { householdId: household.id },
      select: { id: true, name: true, kind: true, parentId: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-on-surface-variant text-sm">
            Movimientos detectados desde tu correo. Confirma, asigna cuenta y categoría, o
            ignóralos.
          </p>
        </div>
        <Chip tone={pending.length > 0 ? "negative" : "positive"}>
          {pending.length} pendientes
        </Chip>
      </div>

      {pending.length === 0 ? (
        <Card tone="muted" className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-tertiary-container/20 text-tertiary flex items-center justify-center mb-4">
            <PartyPopper size={22} />
          </div>
          <h3 className="font-headline text-xl font-bold mb-1">Todo al día</h3>
          <p className="text-sm text-on-surface-variant">No hay movimientos por conciliar.</p>
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
