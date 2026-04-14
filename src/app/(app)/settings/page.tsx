import { Card } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { SignOutButton } from "./SignOutButton";

export default async function SettingsPage() {
  const { user, household } = await requireHousehold();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
      <Card>
        <div className="text-xs uppercase text-slate mb-1">Sesión</div>
        <div className="font-medium">{user.name}</div>
        <div className="text-sm text-slate">{user.email}</div>
        <div className="mt-4"><SignOutButton /></div>
      </Card>
      <Card>
        <div className="text-xs uppercase text-slate mb-1">Hogar</div>
        <div className="font-medium">{household.name}</div>
        <div className="text-sm text-slate">Moneda: {household.currency}</div>
      </Card>
    </div>
  );
}
