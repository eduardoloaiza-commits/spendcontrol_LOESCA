import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AdminResetForm } from "./AdminResetForm";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminResetPage() {
  return (
    <main className="min-h-screen flex flex-col bg-surface">
      <header className="px-6 md:px-10 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <ShieldCheck size={20} />
          </div>
          <div className="font-headline font-extrabold tracking-tight text-lg text-primary leading-none">
            spendcontrol
          </div>
        </Link>
      </header>

      <section className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">
            Bootstrap admin
          </h1>
          <p className="text-sm text-on-surface-variant mb-8">
            Solo para el dueño. Resetea clave o crea un usuario admin con el token
            configurado en el servidor (<code>ADMIN_RESET_TOKEN</code>).
          </p>
          <AdminResetForm />
          <p className="text-center text-xs text-on-surface-variant mt-6">
            <Link href="/" className="font-bold text-primary hover:underline">
              Volver al inicio
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
