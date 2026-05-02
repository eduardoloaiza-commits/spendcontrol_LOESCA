import { ShieldAlert } from "lucide-react";
import { requireUser } from "@/lib/household";

export default async function NoHouseholdPage() {
  const user = await requireUser();
  return (
    <div className="max-w-xl">
      <div className="rounded-bento bg-surface-container-low p-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-5">
          <ShieldAlert size={20} />
        </div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
          Aún no tienes un hogar asignado
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Tu cuenta ({user.email}) está activa, pero un administrador todavía no te ha asignado a
          un hogar. Pídele al administrador que te asigne para empezar a usar SpendControl.
        </p>
      </div>
    </div>
  );
}
