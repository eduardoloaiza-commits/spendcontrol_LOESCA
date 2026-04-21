import Link from "next/link";
import { Users } from "lucide-react";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col bg-surface">
      <header className="px-6 md:px-10 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <Users size={20} />
          </div>
          <div className="font-headline font-extrabold tracking-tight text-lg text-primary leading-none">
            spendcontrol
          </div>
        </Link>
      </header>

      <section className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">
            Crea tu cuenta
          </h1>
          <p className="text-sm text-on-surface-variant mb-8">
            Empieza a organizar las finanzas de tu familia en segundos.
          </p>
          <RegisterForm />
          <p className="text-center text-xs text-on-surface-variant mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/" className="font-bold text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
