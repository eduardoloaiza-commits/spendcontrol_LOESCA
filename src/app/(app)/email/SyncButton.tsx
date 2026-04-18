"use client";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function SyncButton() {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>();
  async function run() {
    setBusy(true);
    setMsg(undefined);
    const res = await fetch("/api/email/sync", { method: "POST" });
    const data = await res.json();
    setMsg(res.ok ? `Procesados ${data.created ?? 0} movimientos` : data.error ?? "error");
    setBusy(false);
    r.refresh();
  }
  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-xs text-on-surface-variant">{msg}</span>}
      <Button onClick={run} disabled={busy}>
        <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
        {busy ? "Sincronizando…" : "Sincronizar"}
      </Button>
    </div>
  );
}
