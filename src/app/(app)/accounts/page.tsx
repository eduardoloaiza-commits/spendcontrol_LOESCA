import { Card, CardTitle } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/money";
import { AccountForm } from "./AccountForm";
import { CreditCard, Landmark, PiggyBank, Banknote, Wallet } from "lucide-react";

const iconByKind: Record<string, typeof Wallet> = {
  checking: Landmark,
  credit: CreditCard,
  savings: PiggyBank,
  cash: Banknote,
  other: Wallet,
};

const kindLabel: Record<string, string> = {
  checking: "Corriente",
  credit: "Tarjeta",
  savings: "Ahorro",
  cash: "Efectivo",
  other: "Otra",
};

export default async function AccountsPage() {
  const { household } = await requireHousehold();
  const accounts = await prisma.finAccount.findMany({
    where: { householdId: household.id, archived: false },
    include: { transactions: { where: { status: "confirmed" } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((a) => {
          const saldo =
            a.openingBalance + a.transactions.reduce((s, t) => s + t.amount, 0);
          const Icon = iconByKind[a.kind] ?? Wallet;
          return (
            <Card key={a.id} className="p-6 min-h-[180px] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {kindLabel[a.kind] ?? a.kind}
                </span>
              </div>
              <div>
                <div className="font-headline font-bold text-on-surface">{a.name}</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">
                  {a.bank ?? "—"} {a.last4 ? `· ****${a.last4}` : ""}
                </div>
                <div
                  className={`amount font-headline text-3xl font-extrabold mt-3 ${
                    saldo < 0 ? "text-error" : "text-on-surface"
                  }`}
                >
                  {formatCLP(saldo)}
                </div>
              </div>
            </Card>
          );
        })}
        {accounts.length === 0 && (
          <Card tone="muted" className="col-span-full text-center py-10">
            <p className="text-sm text-on-surface-variant">Aún no tienes cuentas. Crea una abajo.</p>
          </Card>
        )}
      </div>

      <Card tone="muted">
        <CardTitle>Nueva cuenta</CardTitle>
        <AccountForm />
      </Card>
    </div>
  );
}
