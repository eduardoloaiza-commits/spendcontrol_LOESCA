"use client";
import { usePathname } from "next/navigation";
import { Bell, Search, Users } from "lucide-react";

const sectionTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Resumen", subtitle: "Control del mes" },
  "/transactions": { title: "Movimientos", subtitle: "Historial de gastos e ingresos" },
  "/accounts": { title: "Cuentas", subtitle: "Saldos por cuenta" },
  "/categories": { title: "Categorías", subtitle: "Cómo organizas tu gasto" },
  "/reconcile": { title: "Conciliar", subtitle: "Centro de reconciliación" },
  "/email": { title: "Correo", subtitle: "Fuentes de datos conectadas" },
  "/settings": { title: "Ajustes", subtitle: "Sesión y hogar" },
};

export function TopBar({
  householdName,
  userName,
  userImage,
}: {
  householdName: string;
  userName?: string | null;
  userImage?: string | null;
}) {
  const path = usePathname() ?? "/dashboard";
  const key = Object.keys(sectionTitles).find((k) => path.startsWith(k)) ?? "/dashboard";
  const section = sectionTitles[key];

  const initials = (userName ?? "·")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 flex items-center justify-between px-4 md:px-8 bg-surface/80 backdrop-blur-md shadow-sm z-40">
      <div className="flex items-center gap-4 pl-12 md:pl-0">
        <h2 className="font-headline text-lg md:text-xl font-extrabold text-on-surface tracking-tight">
          {section.title}
        </h2>
        <div className="hidden md:block h-4 w-[1px] bg-outline-variant/40" />
        <span className="hidden md:block text-sm font-medium text-on-surface-variant">
          {section.subtitle}
        </span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative hidden lg:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            className="bg-surface-container-high border-none rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/40 outline-none transition-all"
            placeholder="Buscar movimiento…"
            type="text"
          />
        </div>

        <button
          aria-label="Notificaciones"
          className="relative p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface leading-tight">{householdName}</p>
            <p className="text-[10px] text-on-surface-variant">Plan familiar</p>
          </div>
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={userName ?? "Perfil"}
              src={userImage}
              className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">
              {initials || <Users size={14} />}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
