import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/SignInButton";
import { ShieldCheck, Users } from "lucide-react";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");
  return (
    <main className="min-h-screen flex flex-col bg-surface">
      <header className="px-6 md:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <Users size={20} />
          </div>
          <div className="font-headline font-extrabold tracking-tight text-lg text-primary leading-none">
            spendcontrol
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          <ShieldCheck size={14} />
          Acceso privado
        </span>
      </header>

      <section className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">
            Inicia sesión
          </h1>
          <p className="text-sm text-on-surface-variant mb-8">
            Esta aplicación no es pública. Ingresa con la cuenta que el administrador te asignó.
          </p>
          <SignInButton />
          <p className="text-center text-xs text-on-surface-variant mt-6">
            ¿Necesitas acceso? Contacta al administrador.
          </p>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-on-surface-variant">
        © {new Date().getFullYear()} SpendControl
      </footer>
    </main>
  );
}
