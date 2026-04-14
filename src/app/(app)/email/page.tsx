import { Card } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { SyncButton } from "./SyncButton";
import { format } from "date-fns";

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Correo</h1>
        <p className="text-slate text-sm mt-1">
          Sólo leemos correos que parecen notificaciones bancarias. Jamás enviamos ni publicamos nada.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Gmail</div>
            <div className="text-xs text-slate">
              {hasGoogle ? `Conectado como ${user.email}` : "No conectado"}
            </div>
          </div>
          {hasGoogle ? <SyncButton /> : <a className="text-sm underline" href="/api/auth/signin">Conectar</a>}
        </div>
      </Card>

      {sources.map((s) => (
        <Card key={s.id}>
          <div className="text-xs uppercase tracking-wider text-slate mb-2">
            {s.email} · último sync {s.lastSyncAt ? format(s.lastSyncAt, "dd MMM HH:mm") : "—"}
          </div>
          <ul className="divide-y divide-silver/60">
            {s.messages.map((m) => (
              <li key={m.id} className="py-2 text-sm">
                <div className="font-medium truncate">{m.subject}</div>
                <div className="text-xs text-slate truncate">{m.snippet}</div>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
