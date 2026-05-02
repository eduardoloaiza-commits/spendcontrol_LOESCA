import { Sidebar } from "@/components/nav/Sidebar";
import { TopBar } from "@/components/nav/TopBar";
import { Providers } from "@/components/Providers";
import { requireUser, getUserHousehold } from "@/lib/household";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const found = await getUserHousehold(user.id);
  const householdName = found?.household.name ?? "Sin hogar asignado";

  return (
    <Providers>
      <div className="min-h-screen bg-surface">
        <Sidebar role={user.role} />
        <TopBar
          householdName={householdName}
          userName={user.name ?? user.email ?? ""}
          userImage={user.image}
        />
        <main className="md:ml-64 min-h-screen">
          <section className="pt-24 px-4 md:px-8 pb-12 max-w-7xl mx-auto">{children}</section>
        </main>
      </div>
    </Providers>
  );
}
