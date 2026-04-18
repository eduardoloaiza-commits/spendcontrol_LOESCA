import { Card, CardTitle } from "@/components/ui/Card";
import { requireHousehold } from "@/lib/household";
import { SignOutButton } from "./SignOutButton";
import { User, Home } from "lucide-react";

export default async function SettingsPage() {
  const { user, household } = await requireHousehold();
  const initials = (user.name ?? user.email ?? "·")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardTitle>Sesión</CardTitle>
        <div className="flex items-center gap-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? "Perfil"}
              className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
              {initials || <User size={20} />}
            </div>
          )}
          <div>
            <div className="font-headline font-bold text-on-surface">{user.name ?? "—"}</div>
            <div className="text-sm text-on-surface-variant">{user.email}</div>
          </div>
        </div>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </Card>

      <Card>
        <CardTitle>Hogar</CardTitle>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
            <Home size={22} />
          </div>
          <div>
            <div className="font-headline font-bold text-on-surface">{household.name}</div>
            <div className="text-sm text-on-surface-variant">Moneda: {household.currency}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
