import { Card } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/money";
import { AccountForm } from "./AccountForm";

export default async function AccountsPage() {
  const { household } = await requireHousehold();
  const accounts = await prisma.finAccount.findMany({
    where: { householdId: household.id, archived: false },
    include: { transactions: { where: { status: "confirmed" } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Cuentas</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {accounts.map((a) => {
          const saldo =
            a.openingBalance + a.transactions.reduce((s, t) => s + t.amount, 0);
          return (
            <Card key={a.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-slate">
                    {a.kind} · {a.bank ?? "—"} {a.last4 ? `· ****${a.last4}` : ""}
                  </div>
                </div>
                <div className="amount text-2xl font-semibold">{formatCLP(saldo)}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="font-medium mb-4">Nueva cuenta</div>
        <AccountForm />
      </Card>
    </div>
  );
}
