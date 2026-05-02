import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Home, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const [userCount, adminCount, householdCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.household.count(),
  ]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Link
        href="/admin/users"
        className="rounded-bento bg-surface-container-low p-6 hover:shadow-md transition-all group"
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
            <Users size={20} />
          </div>
          <ArrowRight
            size={18}
            className="text-on-surface-variant group-hover:translate-x-1 transition-transform"
          />
        </div>
        <h2 className="font-headline text-xl font-extrabold mt-4 text-on-surface">Usuarios</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          {userCount} cuenta{userCount === 1 ? "" : "s"} · {adminCount} admin
          {adminCount === 1 ? "" : "s"}
        </p>
      </Link>

      <Link
        href="/admin/households"
        className="rounded-bento bg-surface-container-low p-6 hover:shadow-md transition-all group"
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
            <Home size={20} />
          </div>
          <ArrowRight
            size={18}
            className="text-on-surface-variant group-hover:translate-x-1 transition-transform"
          />
        </div>
        <h2 className="font-headline text-xl font-extrabold mt-4 text-on-surface">Hogares</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          {householdCount} hogar{householdCount === 1 ? "" : "es"} configurado
          {householdCount === 1 ? "" : "s"}
        </p>
      </Link>
    </div>
  );
}
