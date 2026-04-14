"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  Mail,
  CheckCircle2,
  Settings,
} from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", icon: Receipt },
  { href: "/accounts", label: "Cuentas", icon: Wallet },
  { href: "/categories", label: "Categorías", icon: Tags },
  { href: "/reconcile", label: "Conciliar", icon: CheckCircle2 },
  { href: "/email", label: "Correo", icon: Mail },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-silver/60 p-4 hidden md:flex flex-col gap-1 h-screen sticky top-0">
      <div className="font-bold tracking-tight text-lg px-2 mb-6">spendcontrol</div>
      {items.map((it) => {
        const Active = path?.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
              Active ? "bg-mist text-ink font-medium" : "text-slate hover:bg-mist/60",
            )}
          >
            <it.icon size={18} />
            {it.label}
          </Link>
        );
      })}
    </aside>
  );
}
