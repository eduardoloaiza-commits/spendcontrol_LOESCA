import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/SignInButton";

export default async function Landing() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="font-bold tracking-tight text-lg">spendcontrol</div>
        <Link href="#como" className="text-sm text-slate">Cómo funciona</Link>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Entiende a dónde va tu dinero.
          </h1>
          <p className="mt-6 text-lg text-slate max-w-xl mx-auto">
            Conecta tu correo, detectamos los gastos automáticamente y tú
            los concilias en segundos. Una herramienta simple para las finanzas de tu familia.
          </p>
          <div className="mt-10 flex justify-center">
            <SignInButton />
          </div>
          <p className="mt-4 text-xs text-slate">Solo lectura de correos bancarios. Nunca publicamos ni enviamos nada.</p>
        </div>
      </section>

      <section id="como" className="border-t border-silver/60 py-16 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            ["Conecta tu correo", "Importamos solo notificaciones bancarias."],
            ["Crea tus cuentas", "Corriente, tarjeta, efectivo. Las que necesites."],
            ["Concilia con un tap", "Aprueba, categoriza o ignora cada gasto."],
          ].map(([t, d]) => (
            <div key={t} className="p-6 rounded-card bg-mist">
              <div className="text-sm font-semibold">{t}</div>
              <div className="mt-2 text-sm text-slate">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-slate">
        © {new Date().getFullYear()} SpendControl
      </footer>
    </main>
  );
}
