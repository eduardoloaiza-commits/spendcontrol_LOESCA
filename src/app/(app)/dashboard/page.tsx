import Link from "next/link";
import { Card, CardTitle, Chip } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/money";
import { startOfMonth } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Sparkles,
  Wallet,
  Tag,
} from "lucide-react";

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

  const porCategoria: Record<string, { total: number; color?: string | null }> = {};
  for (const t of txs) {
    if (t.amount >= 0) continue;
    const key = t.category?.name ?? "Sin categoría";
    const prev = porCategoria[key] ?? { total: 0, color: t.category?.color };
    porCategoria[key] = { total: prev.total + Math.abs(t.amount), color: t.category?.color ?? prev.color };
  }
  const top = Object.entries(porCategoria)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);
  const totalGasto = Math.abs(gastos) || 1;

  const pendientes = await prisma.transaction.count({
    where: { householdId: household.id, status: "pending" },
  });

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Hero */}
      <Card tone="hero" className="col-span-12 lg:col-span-8 flex flex-col justify-between min-h-[260px]">
        <div className="relative z-10">
          <p className="text-primary-fixed/80 font-medium tracking-wide">Neto del mes</p>
          <h3 className="amount font-headline text-5xl md:text-6xl font-extrabold mt-2 tracking-tight">
            {formatCLP(neto)}
          </h3>
          <p className="text-primary-fixed/80 text-sm mt-2">{household.name}</p>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10">
            <p className="text-primary-fixed/70 text-xs mb-1">Ingresos</p>
            <div className="flex items-end gap-2">
              <p className="amount text-2xl font-bold">{formatCLP(ingresos)}</p>
              <ArrowUpRight size={14} className="text-tertiary-fixed-dim mb-1" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10">
            <p className="text-primary-fixed/70 text-xs mb-1">Gastos</p>
            <div className="flex items-end gap-2">
              <p className="amount text-2xl font-bold">{formatCLP(gastos)}</p>
              <ArrowDownRight size={14} className="text-error-container mb-1" />
            </div>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-primary-container/30 rounded-full blur-2xl" />
      </Card>

      {/* Pending */}
      <Card tone="muted" className="col-span-12 lg:col-span-4 flex flex-col justify-between min-h-[260px]">
        <div className="flex items-start justify-between">
          <div className="p-3 bg-primary-fixed text-primary rounded-2xl">
            <Sparkles size={20} />
          </div>
          <Chip tone={pendientes > 0 ? "negative" : "positive"}>
            {pendientes > 0 ? "Acción" : "Al día"}
          </Chip>
        </div>
        <div>
          <p className="text-on-surface-variant text-sm font-medium">Por conciliar</p>
          <h4 className="amount font-headline text-4xl font-extrabold text-on-surface mt-1">
            {pendientes}
          </h4>
          <p className="text-xs text-on-surface-variant mt-1">
            {pendientes === 0
              ? "No tienes nada pendiente 🎉"
              : "Movimientos detectados desde tu correo"}
          </p>
        </div>
        {pendientes > 0 && (
          <Link
            href="/reconcile"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl py-3 px-4 font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Conciliar ahora
          </Link>
        )}
      </Card>

      {/* Top categorías */}
      <Card tone="muted" className="col-span-12 lg:col-span-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <CardTitle className="mb-1">Top categorías</CardTitle>
            <h4 className="font-headline text-xl font-bold">Dónde va tu gasto</h4>
          </div>
          <Link href="/transactions" className="text-primary font-bold text-sm hover:underline">
            Ver todo
          </Link>
        </div>
        {top.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Aún no hay gastos este mes.</p>
        ) : (
          <ul className="space-y-4">
            {top.map(([name, { total, color }]) => {
              const pct = Math.round((total / totalGasto) * 100);
              return (
                <li key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: color ?? "#004bba" }}
                      />
                      <span className="text-sm font-medium text-on-surface">{name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-on-surface-variant">{pct}%</span>
                      <span className="amount text-sm font-bold">{formatCLP(-total)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: color ?? "#004bba" }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Últimos movimientos */}
      <Card className="col-span-12 lg:col-span-5">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-headline text-xl font-bold">Últimos movimientos</h4>
          <Link href="/transactions" className="text-primary font-bold text-sm hover:underline">
            Ver todo
          </Link>
        </div>
        {txs.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Sin movimientos todavía.</p>
        ) : (
          <ul className="space-y-4">
            {txs.slice(0, 6).map((t) => {
              const Icon = iconForCategory(t.category?.name);
              const negative = t.amount < 0;
              return (
                <li key={t.id} className="flex items-center gap-4">
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
                      {t.finAccount.name} · {t.category?.name ?? "Sin categoría"}
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

function iconForCategory(name?: string | null) {
  const n = (name ?? "").toLowerCase();
  if (/super|merc|comida|aliment/.test(n)) return ShoppingCart;
  if (/casa|hogar|arriendo|hipoteca/.test(n)) return Home;
  if (/trans|auto|gasolina|bencina|uber/.test(n)) return Car;
  if (/rest|comida fuera|cafe/.test(n)) return Utensils;
  if (/suel|ingres|salario/.test(n)) return Wallet;
  return Tag;
}
