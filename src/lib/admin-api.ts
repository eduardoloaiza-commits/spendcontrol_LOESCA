import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function requireAdminApi() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!user) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  if (user.role !== "admin") {
    return { error: NextResponse.json({ error: "Sin permisos" }, { status: 403 }) };
  }
  return { user };
}
