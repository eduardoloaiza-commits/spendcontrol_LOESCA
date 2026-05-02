import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/household";
import { UsersClient } from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await requireAdmin();
  const [users, households] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        households: {
          select: {
            role: true,
            household: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.household.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return <UsersClient initialUsers={users} households={households} currentUserId={me.id} />;
}
