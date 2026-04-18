import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/SignInButton";
import { Mail, Wallet, CheckSquare, Users, ShieldCheck } from "lucide-react";

export default async function Landing() {
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
        <Link
          href="#como"
          className="text-sm font-medium text-on-surface-variant hover:text-on-surface"
        >
          Cómo funciona
        </Link>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-5xl w-full mx-auto px-6 md:px-10 py-16 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary-fixed rounded-full px-3 py-1.5 mb-6">
              <ShieldCheck size={14} />
              Sólo lectura · tu correo, tu data
            </p>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-on-surface">
              Entiende a dónde va tu dinero.
            </h1>
            <p className="mt-6 text-lg text-on-surface-variant max-w-xl">
              Conecta tu correo, detectamos los gastos automáticamente y tú los concilias en
              segundos. Una herramienta simple para las finanzas de tu familia.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <SignInButton />
              <span className="text-xs text-on-surface-variant">
                Nunca publicamos ni enviamos nada.
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-bento bg-gradient-to-br from-primary to-primary-container text-on-primary p-8 shadow-hero relative overflow-hidden">
              <p className="text-primary-fixed/80 font-medium tracking-wide">Gasto del mes</p>
              <h3 className="amount text-5xl font-extrabold mt-2 tracking-tight">$1.240.500</h3>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10">
                  <p className="text-primary-fixed/70 text-xs mb-1">Por conciliar</p>
                  <p className="text-xl font-bold">12</p>
                </div>
                <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10">
                  <p className="text-primary-fixed/70 text-xs mb-1">Cuentas</p>
                  <p className="text-xl font-bold">3</p>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      <section id="como" className="border-t border-outline-variant/30 py-20 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight mb-10">
            En tres pasos.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: "Conecta tu correo",
                desc: "Leemos sólo notificaciones bancarias. Nada más.",
              },
              {
                icon: Wallet,
                title: "Crea tus cuentas",
                desc: "Corriente, tarjeta, efectivo. Las que necesites.",
              },
              {
                icon: CheckSquare,
                title: "Concilia con un tap",
                desc: "Aprueba, categoriza o ignora cada gasto.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-8 rounded-bento bg-surface-container-low">
                <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-5">
                  <Icon size={20} />
                </div>
                <div className="font-headline font-bold text-lg text-on-surface">{title}</div>
                <div className="mt-2 text-sm text-on-surface-variant">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-on-surface-variant">
        © {new Date().getFullYear()} SpendControl
      </footer>
    </main>
  );
}
