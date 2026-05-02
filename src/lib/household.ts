import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function getUserHousehold(userId: string) {
  const member = await prisma.householdMember.findFirst({
    where: { userId },
    include: { household: true },
    orderBy: { id: "asc" },
  });
  if (!member) return null;
  return { household: member.household, role: member.role };
}

export async function requireHousehold() {
  const user = await requireUser();
  const found = await getUserHousehold(user.id);
  if (!found) redirect("/no-household");
  return { user, household: found.household, role: found.role };
}
