import { Card } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { TransactionForm } from "./TransactionForm";
import { TransactionsList } from "./TransactionsList";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const { household } = await requireHousehold();
  const [txs, accounts, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { householdId: household.id },
      include: {
        category: { include: { parent: true } },
        finAccount: true,
      },
      orderBy: { occurredAt: "desc" },
      take: 200,
    }),
    prisma.finAccount.findMany({ where: { householdId: household.id, archived: false } }),
    prisma.category.findMany({
      where: { householdId: household.id },
      select: { id: true, name: true, kind: true, parentId: true },
    }),
  ]);

  const items = txs.map((t) => ({
    id: t.id,
    amount: t.amount,
    description: t.description,
    merchant: t.merchant,
    occurredAt: t.occurredAt.toISOString(),
    status: t.status,
    finAccountId: t.finAccountId,
    finAccountName: t.finAccount.name,
    categoryId: t.categoryId,
    categoryName: t.category?.name ?? null,
    parentCategoryName: t.category?.parent?.name ?? null,
  }));

  return (
    <div className="space-y-8">
      <Card tone="muted">
        <div className="font-headline text-lg font-bold mb-5">Registrar movimiento</div>
        <TransactionForm accounts={accounts} categories={categories} />
      </Card>

      <TransactionsList items={items} accounts={accounts} categories={categories} />
    </div>
  );
}
