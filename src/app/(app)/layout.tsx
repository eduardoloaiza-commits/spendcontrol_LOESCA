import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/nav/Sidebar";
import { Providers } from "@/components/Providers";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  return (
    <Providers>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10 max-w-6xl">{children}</main>
      </div>
    </Providers>
  );
}
