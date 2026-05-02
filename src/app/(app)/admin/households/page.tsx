import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/household";
import { HouseholdsClient } from "./HouseholdsClient";

export const dynamic = "force-dynamic";

export default async function AdminHouseholdsPage() {
  await requireAdmin();
  const [households, users] = await Promise.all([
    prisma.household.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        currency: true,
        createdAt: true,
        members: {
          select: {
            id: true,
            role: true,
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { id: "asc" },
        },
        _count: { select: { transactions: true, finAccounts: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { email: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return <HouseholdsClient initialHouseholds={households} allUsers={users} />;
}
