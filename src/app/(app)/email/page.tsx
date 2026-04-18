import { Card, CardTitle, Chip } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { SyncButton } from "./SyncButton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, ShieldCheck, CircleCheck } from "lucide-react";

export default async function EmailPage() {
  const { user, household } = await requireHousehold();
  const sources = await prisma.emailSource.findMany({
    where: { householdId: household.id },
    include: { messages: { take: 10, orderBy: { receivedAt: "desc" } } },
  });
  const hasGoogle = await prisma.account.findFirst({
    where: { userId: user.id, provider: "google" },
  });

  return (
    <div className="space-y-6">
      <p className="text-on-surface-variant text-sm max-w-2xl">
        Sólo leemos correos que parecen notificaciones bancarias. Jamás enviamos ni publicamos
        nada.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div className="min-w-0">
              <div className="font-headline font-bold text-on-surface">Gmail</div>
              <div className="text-[11px] text-on-surface-variant truncate">
                {hasGoogle ? `Conectado como ${user.email}` : "No conectado"}
              </div>
            </div>
          </div>
          {hasGoogle ? (
            <SyncButton />
          ) : (
            <a
              className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl px-5 py-3 font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              href="/api/auth/signin"
            >
              Conectar
            </a>
          )}
        </Card>

        <Card tone="muted">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-tertiary-container/20 text-tertiary">
              <ShieldCheck size={16} />
            </div>
            <div>
              <CardTitle className="mb-1">Privacidad</CardTitle>
              <ul className="text-xs text-on-surface-variant space-y-1.5">
                <li className="flex items-start gap-2">
                  <CircleCheck size={12} className="text-tertiary mt-0.5" />
                  Lectura, nunca escritura ni envío.
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheck size={12} className="text-tertiary mt-0.5" />
                  Sólo notificaciones bancarias.
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheck size={12} className="text-tertiary mt-0.5" />
                  Puedes desconectar cuando quieras.
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {sources.map((s) => (
        <Card key={s.id}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>{s.email}</CardTitle>
              <h4 className="font-headline text-base font-bold">Últimos correos</h4>
            </div>
            <Chip>
              {s.lastSyncAt
                ? `Sync ${format(s.lastSyncAt, "dd MMM HH:mm", { locale: es })}`
                : "Sin sync"}
            </Chip>
          </div>
          <ul className="divide-y divide-outline-variant/20">
            {s.messages.map((m) => (
              <li key={m.id} className="py-3">
                <div className="font-medium text-sm text-on-surface truncate">{m.subject}</div>
                <div className="text-[11px] text-on-surface-variant truncate mt-0.5">
                  {m.snippet}
                </div>
              </li>
            ))}
            {s.messages.length === 0 && (
              <li className="py-3 text-xs text-on-surface-variant">Sin correos todavía.</li>
            )}
          </ul>
        </Card>
      ))}
    </div>
  );
}
