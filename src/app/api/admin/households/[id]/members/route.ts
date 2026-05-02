import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

const addSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["owner", "editor", "viewer"]).default("editor"),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const hh = await prisma.household.findUnique({ where: { id: params.id } });
  if (!hh) return NextResponse.json({ error: "Hogar no encontrado" }, { status: 404 });
  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  try {
    const member = await prisma.householdMember.create({
      data: {
        userId: parsed.data.userId,
        householdId: params.id,
        role: parsed.data.role,
      },
      select: {
        id: true,
        role: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ member }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "Ese usuario ya pertenece al hogar" },
        { status: 409 },
      );
    }
    throw err;
  }
}
