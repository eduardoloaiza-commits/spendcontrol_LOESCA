import { Card, Chip } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/money";
import { TransactionForm } from "./TransactionForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ShoppingCart, Home, Car, Utensils, Wallet, Tag } from "lucide-react";

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
      <Card tone="muted">
        <div className="font-headline text-lg font-bold mb-5">Registrar movimiento</div>
        <TransactionForm accounts={accounts} categories={categories} />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline text-xl font-bold">Historial</h3>
          <Chip>{txs.length} movimientos</Chip>
        </div>
        {txs.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Sin movimientos todavía.</p>
        ) : (
          <ul className="divide-y divide-outline-variant/20">
            {txs.map((t) => {
              const Icon = iconFor(t.category?.name);
              const negative = t.amount < 0;
              return (
                <li key={t.id} className="py-4 flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      negative
                        ? "bg-surface-container-low text-on-surface-variant"
                        : "bg-tertiary-container/15 text-tertiary"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">{t.description}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {format(t.occurredAt, "dd MMM", { locale: es })} · {t.finAccount.name} ·{" "}
                      {t.category?.name ?? "Sin categoría"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`amount font-extrabold text-sm ${
                        negative ? "text-on-surface" : "text-tertiary"
                      }`}
                    >
                      {formatCLP(t.amount)}
                    </p>
                    <div className="mt-1 flex justify-end">
                      <Chip tone={statusTone(t.status)}>{statusLabel(t.status)}</Chip>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function iconFor(name?: string | null) {
  const n = (name ?? "").toLowerCase();
  if (/super|merc|aliment/.test(n)) return ShoppingCart;
  if (/casa|hogar|arriendo/.test(n)) return Home;
  if (/trans|auto|gasolina|bencina/.test(n)) return Car;
  if (/rest|comida/.test(n)) return Utensils;
  if (/suel|ingres|salario/.test(n)) return Wallet;
  return Tag;
}

function statusTone(s: string): "neutral" | "positive" | "negative" | "primary" {
  if (s === "confirmed") return "positive";
  if (s === "pending") return "negative";
  if (s === "ignored") return "neutral";
  return "primary";
}

function statusLabel(s: string) {
  if (s === "confirmed") return "Confirmado";
  if (s === "pending") return "Pendiente";
  if (s === "ignored") return "Ignorado";
  return s;
}
