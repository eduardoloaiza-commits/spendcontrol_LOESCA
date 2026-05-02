import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

const createSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
  role: z.enum(["admin", "user"]).default("user"),
  householdId: z.string().min(1).optional(),
  householdRole: z.enum(["owner", "editor", "viewer"]).default("editor"),
});

export async function GET() {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const users = await prisma.user.findMany({
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
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { name, email, password, role, householdId, householdRole } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ese email ya está registrado" }, { status: 409 });
  }

  if (householdId) {
    const hh = await prisma.household.findUnique({ where: { id: householdId } });
    if (!hh) return NextResponse.json({ error: "Hogar no encontrado" }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name: name ?? null,
      passwordHash,
      role,
      ...(householdId
        ? { households: { create: { householdId, role: householdRole } } }
        : {}),
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
