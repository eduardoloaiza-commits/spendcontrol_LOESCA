"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { formatCLP } from "@/lib/money";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Receipt } from "lucide-react";

type Tx = {
  id: string;
  amount: number;
  description: string;
  merchant?: string | null;
  finAccountId: string;
  categoryId?: string | null;
  occurredAt: string | Date;
};

export function ReconcileRow({
  tx,
  accounts,
  categories,
}: {
  tx: Tx;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; kind?: string }[];
}) {
  const r = useRouter();
  const [accountId, setAccountId] = useState(tx.finAccountId);
  const [categoryId, setCategoryId] = useState(tx.categoryId ?? "");
  const [busy, setBusy] = useState(false);

  async function patch(status: "confirmed" | "ignored") {
    setBusy(true);
    await fetch(`/api/transactions/${tx.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, finAccountId: accountId, categoryId: categoryId || null }),
    });
    setBusy(false);
    r.refresh();
  }

  const negative = tx.amount < 0;

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <Receipt size={18} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-on-surface truncate">{tx.description}</div>
            <div className="text-[11px] text-on-surface-variant truncate">
              {tx.merchant ?? "—"} · {new Date(tx.occurredAt).toLocaleDateString("es-CL")}
            </div>
          </div>
        </div>

        <div
          className={`amount font-extrabold text-lg ${
            negative ? "text-on-surface" : "text-tertiary"
          }`}
        >
          {formatCLP(tx.amount)}
        </div>

        <div className="grid grid-cols-2 md:flex gap-2 md:w-auto">
          <div className="w-full md:w-44">
            <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          </div>
          <div className="w-full md:w-44">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Categoría…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button disabled={busy} onClick={() => patch("confirmed")}>
            Confirmar
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => patch("ignored")}>
            Ignorar
          </Button>
        </div>
      </div>
    </Card>
  );
}
