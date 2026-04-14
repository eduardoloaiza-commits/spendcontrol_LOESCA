import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function getOrCreateHousehold(userId: string) {
  const member = await prisma.householdMember.findFirst({
    where: { userId },
    include: { household: true },
  });
  if (member) return member.household;
  const hh = await prisma.household.create({
    data: {
      name: "Mi hogar",
      members: { create: { userId, role: "owner" } },
      categories: {
        create: [
          { name: "Supermercado", kind: "expense", color: "#1E40FF" },
          { name: "Comida fuera", kind: "expense", color: "#FF5A4E" },
          { name: "Transporte", kind: "expense", color: "#FFB020" },
          { name: "Servicios", kind: "expense", color: "#0EA5E9" },
          { name: "Sueldo", kind: "income", color: "#00E28A" },
        ],
      },
    },
  });
  return hh;
}

export async function requireHousehold() {
  const user = await getSessionUser();
  if (!user) throw new Error("unauthorized");
  const hh = await getOrCreateHousehold(user.id);
  return { user, household: hh };
}
