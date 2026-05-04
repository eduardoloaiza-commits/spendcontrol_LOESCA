import Link from "next/link";
import { Card, CardTitle, Chip } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/money";
import { FondoForm } from "./FondoForm";
import { PiggyBank, Target, Calendar } from "lucide-react";
import { startOfMonth, differenceInCalendarDays } from "date-fns";

export default async function FondosPage() {
  const { household } = await requireHousehold();
  const fondos = await prisma.finAccount.findMany({
    where: { householdId: household.id, archived: false, kind: "fund" },
    include: { transactions: { where: { status: "confirmed" } } },
    orderBy: { createdAt: "asc" },
  });

  const monthStart = startOfMonth(new Date());

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">Fondos de ahorro</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Sub-bolsillos con foco propio. Aporta o retira como en cualquier cuenta y ve el acumulado en el resumen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fondos.map((f) => {
          const saldo = f.openingBalance + f.transactions.reduce((s, t) => s + t.amount, 0);
          const aporteMes = f.transactions
            .filter((t) => t.amount > 0 && t.occurredAt >= monthStart)
            .reduce((s, t) => s + t.amount, 0);
          const goalPct = f.goalAmount && f.goalAmount > 0
            ? Math.max(0, Math.min(100, Math.round((saldo / f.goalAmount) * 100)))
            : null;
          const monthlyPct = f.monthlyTarget && f.monthlyTarget > 0
            ? Math.max(0, Math.min(100, Math.round((aporteMes / f.monthlyTarget) * 100)))
            : null;
          const diasRestantes = f.goalDate
            ? differenceInCalendarDays(f.goalDate, new Date())
            : null;
          return (
            <Link key={f.id} href={`/fondos/${f.id}`} className="block">
              <Card className="p-6 min-h-[220px] flex flex-col justify-between hover:scale-[1.01] transition-transform">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
                    <PiggyBank size={20} />
                  </div>
                  {diasRestantes !== null && (
                    <Chip tone={diasRestantes < 0 ? "negative" : diasRestantes < 30 ? "primary" : "neutral"}>
                      {diasRestantes < 0
                        ? `Vencido hace ${-diasRestantes}d`
                        : `${diasRestantes}d restantes`}
                    </Chip>
                  )}
                </div>
                <div>
                  <div className="font-headline font-bold text-on-surface">{f.name}</div>
                  {f.focus && (
                    <div className="text-[11px] text-on-surface-variant mt-0.5">{f.focus}</div>
                  )}
                  <div
                    className={`amount font-headline text-3xl font-extrabold mt-3 ${
                      saldo < 0 ? "text-error" : "text-on-surface"
                    }`}
                  >
                    {formatCLP(saldo)}
                  </div>

                  {goalPct !== null && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1">
                          <Target size={11} /> Meta
                        </span>
                        <span className="text-[11px] font-bold text-on-surface">
                          {goalPct}% · {formatCLP(f.goalAmount!)}
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${goalPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {monthlyPct !== null && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1">
                          <Calendar size={11} /> Aporte mes
                        </span>
                        <span className="text-[11px] font-bold text-on-surface">
                          {monthlyPct}% · {formatCLP(aporteMes)} / {formatCLP(f.monthlyTarget!)}
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-tertiary"
                          style={{ width: `${monthlyPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
        {fondos.length === 0 && (
          <Card tone="muted" className="col-span-full text-center py-10">
            <p className="text-sm text-on-surface-variant">
              Aún no tienes fondos. Crea el primero abajo (ej. &ldquo;Vacaciones&rdquo;).
            </p>
          </Card>
        )}
      </div>

      <Card tone="muted">
        <CardTitle>Nuevo fondo</CardTitle>
        <FondoForm />
      </Card>
    </div>
  );
}
