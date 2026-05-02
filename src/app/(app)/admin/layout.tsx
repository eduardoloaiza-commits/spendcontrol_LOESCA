import { requireAdmin } from "@/lib/household";
import Link from "next/link";
import { Users, Home } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            Administración
          </p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Panel de admin
          </h1>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container"
          >
            <Users size={16} /> Usuarios
          </Link>
          <Link
            href="/admin/households"
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container"
          >
            <Home size={16} /> Hogares
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
