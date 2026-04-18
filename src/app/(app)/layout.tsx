import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/nav/Sidebar";
import { TopBar } from "@/components/nav/TopBar";
import { Providers } from "@/components/Providers";
import { requireHousehold } from "@/lib/household";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const { user, household } = await requireHousehold();

  return (
    <Providers>
      <div className="min-h-screen bg-surface">
        <Sidebar />
        <TopBar
          householdName={household.name}
          userName={user.name ?? user.email}
          userImage={user.image}
        />
        <main className="md:ml-64 min-h-screen">
          <section className="pt-24 px-4 md:px-8 pb-12 max-w-7xl mx-auto">{children}</section>
        </main>
      </div>
    </Providers>
  );
}
