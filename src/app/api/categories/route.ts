import { NextResponse } from "next/server";
import { requireHousehold } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  name: z.string().min(1),
  kind: z.enum(["expense", "income", "transfer"]),
  color: z.string().default("#1E40FF"),
});

export async function POST(req: Request) {
  const { household } = await requireHousehold();
  const data = Body.parse(await req.json());
  const c = await prisma.category.create({
    data: { ...data, householdId: household.id },
  });
  return NextResponse.json(c);
}

export async function GET() {
  const { household } = await requireHousehold();
  const cs = await prisma.category.findMany({
    where: { householdId: household.id },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(cs);
}
