"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  Mail,
  CheckSquare,
  Settings,
  Plus,
  LifeBuoy,
  LogOut,
  Users,
  ShieldCheck,
  PiggyBank,
} from "lucide-react";
import clsx from "clsx";
import { signOut } from "next-auth/react";
import { useState } from "react";

const baseItems = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", icon: Receipt },
  { href: "/accounts", label: "Cuentas", icon: Wallet },
  { href: "/fondos", label: "Fondos", icon: PiggyBank },
  { href: "/categories", label: "Categorías", icon: Tags },
  { href: "/reconcile", label: "Conciliar", icon: CheckSquare },
  { href: "/email", label: "Correo", icon: Mail },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

const adminItem = { href: "/admin", label: "Administración", icon: ShieldCheck };

export function Sidebar({ role }: { role?: string }) {
  const items = role === "admin" ? [...baseItems, adminItem] : baseItems;
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const content = (
    <>
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
          <Users size={20} />
        </div>
        <div>
          <h1 className="font-headline text-xl font-extrabold text-primary tracking-tight leading-none">
            spendcontrol
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">
            Finanzas en familia
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {items.map((it) => {
          const active = path?.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all",
                active
                  ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-lowest/60 hover:translate-x-1",
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span className={active ? "font-bold" : "font-medium"}>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-6 space-y-4">
        <Link
          href="/transactions"
          onClick={() => setOpen(false)}
          className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={18} />
          Nuevo movimiento
        </Link>
        <div className="pt-4 border-t border-outline-variant/20">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="text-on-surface-variant flex items-center gap-3 px-4 py-2 hover:translate-x-1 transition-transform text-sm font-medium"
          >
            <LifeBuoy size={16} />
            Ayuda
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-on-surface-variant flex items-center gap-3 px-4 py-2 hover:translate-x-1 transition-transform text-sm font-medium w-full text-left"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface"
      >
        <LayoutDashboard size={18} />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-inverse-surface/40 z-40"
        />
      )}

      <aside
        className={clsx(
          "fixed left-0 top-0 h-full w-64 bg-surface-container-low shadow-sidebar flex flex-col py-6 z-50 transition-transform",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {content}
      </aside>
    </>
  );
}
