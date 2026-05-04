import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardTitle, Chip } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/money";
import { startOfMonth, differenceInCalendarDays, format } from "date-fns";
import { PiggyBank, ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { FondoMovimientoForm } from "./FondoMovimientoForm";
import { FondoEditForm } from "./FondoEditForm";

export const dynamic = "force-dynamic";

export default async function FondoDetalle({ params }: { params: { id: string } }) {
  const { household } = await requireHousehold();
  const fondo = await prisma.finAccount.findFirst({
    where: { id: params.id, householdId: household.id, kind: "fund" },
    include: {
      transactions: {
        where: { status: "confirmed" },
        orderBy: { occurredAt: "desc" },
      },
    },
  });
  if (!fondo) notFound();

  const monthStart = startOfMonth(new Date());
  const saldo = fondo.openingBalance + fondo.transactions.reduce((s, t) => s + t.amount, 0);
  const aporteMes = fondo.transactions
    .filter((t) => t.amount > 0 && t.occurredAt >= monthStart)
    .reduce((s, t) => s + t.amount, 0);
  const goalPct = fondo.goalAmount && fondo.goalAmount > 0
    ? Math.max(0, Math.min(100, Math.round((saldo / fondo.goalAmount) * 100)))
    : null;
  const monthlyPct = fondo.monthlyTarget && fondo.monthlyTarget > 0
    ? Math.max(0, Math.min(100, Math.round((aporteMes / fondo.monthlyTarget) * 100)))
    : null;
  const diasRestantes = fondo.goalDate
    ? differenceInCalendarDays(fondo.goalDate, new Date())
    : null;

  return (
    <div className="space-y-8">
      <Link
        href="/fondos"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft size={14} /> Volver a fondos
      </Link>

      <Card tone="hero" className="min-h-[220px]">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
            <PiggyBank size={20} />
          </div>
          {diasRestantes !== null && (
            <Chip tone={diasRestantes < 0 ? "negative" : "primary"}>
              {diasRestantes < 0
                ? `Vencido hace ${-diasRestantes}d`
                : `${diasRestantes}d para la meta`}
            </Chip>
          )}
        </div>
        <div className="mt-6">
          <p className="text-primary-fixed/80 font-medium tracking-wide">{fondo.focus ?? "Fondo de ahorro"}</p>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold mt-1">{fondo.name}</h2>
          <h3 className="amount font-headline text-5xl font-extrabold mt-4 tracking-tight">
            {formatCLP(saldo)}
          </h3>
          {goalPct !== null && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-primary-fixed/80 font-bold uppercase tracking-wider">
                  Meta
                </span>
                <span className="text-xs font-bold">
                  {goalPct}% · {formatCLP(fondo.goalAmount!)}
                  {fondo.goalDate && ` · ${format(fondo.goalDate, "yyyy-MM-dd")}`}
                </span>
              </div>
              <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${goalPct}%` }}
                />
              </div>
            </div>
          )}
          {monthlyPct !== null && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-primary-fixed/80 font-bold uppercase tracking-wider">
                  Aporte mes
                </span>
                <span className="text-xs font-bold">
                  {monthlyPct}% · {formatCLP(aporteMes)} / {formatCLP(fondo.monthlyTarget!)}
                </span>
              </div>
              <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-tertiary-fixed-dim"
                  style={{ width: `${monthlyPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card tone="muted">
        <CardTitle>Aporte / Retiro</CardTitle>
        <FondoMovimientoForm fondoId={fondo.id} fondoName={fondo.name} />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h4 className="font-headline text-lg font-bold">Historial</h4>
          <span className="text-xs text-on-surface-variant">{fondo.transactions.length} movimientos</span>
        </div>
        {fondo.transactions.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Sin movimientos todavía. Hace tu primer aporte arriba.</p>
        ) : (
          <ul className="space-y-3">
            {fondo.transactions.map((t) => {
              const negative = t.amount < 0;
              return (
                <li key={t.id} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      negative
                        ? "bg-error-container/40 text-error"
                        : "bg-tertiary-container/15 text-tertiary"
                    }`}
                  >
                    {negative ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">{t.description}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {format(t.occurredAt, "yyyy-MM-dd")}
                    </p>
                  </div>
                  <p className={`amount font-extrabold text-sm ${negative ? "text-error" : "text-tertiary"}`}>
                    {formatCLP(t.amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card tone="muted">
        <CardTitle>Editar fondo</CardTitle>
        <FondoEditForm
          fondo={{
            id: fondo.id,
            name: fondo.name,
            focus: fondo.focus,
            monthlyTarget: fondo.monthlyTarget,
            goalAmount: fondo.goalAmount,
            goalDate: fondo.goalDate ? format(fondo.goalDate, "yyyy-MM-dd") : null,
          }}
        />
      </Card>
    </div>
  );
}
