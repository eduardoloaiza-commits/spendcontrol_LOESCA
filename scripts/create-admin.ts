import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const [, , rawEmail, rawPassword, rawName] = process.argv;
  if (!rawEmail) {
    console.error(
      "Uso: npm run auth:create-admin -- <email> [nuevaClave] [nombre]\n" +
        "  - Si el usuario existe, lo promueve a admin (y actualiza la clave si la entregas).\n" +
        "  - Si no existe, lo crea con role=admin (la clave es obligatoria en ese caso).",
    );
    process.exit(1);
  }

  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`Email inválido: ${rawEmail}`);
    process.exit(1);
  }

  const db = new PrismaClient();
  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      const data: { role: string; name?: string; passwordHash?: string } = { role: "admin" };
      if (rawName) data.name = rawName;
      if (rawPassword) {
        if (rawPassword.length < 8) {
          console.error("La clave debe tener al menos 8 caracteres.");
          process.exit(1);
        }
        data.passwordHash = await bcrypt.hash(rawPassword, 10);
      }
      await db.user.update({ where: { id: existing.id }, data });
      console.log(
        `OK: ${email} ahora es admin${rawPassword ? " (clave actualizada)" : ""}.`,
      );
      return;
    }

    if (!rawPassword) {
      console.error("El usuario no existe; debes entregar una clave para crearlo.");
      process.exit(1);
    }
    if (rawPassword.length < 8) {
      console.error("La clave debe tener al menos 8 caracteres.");
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(rawPassword, 10);
    await db.user.create({
      data: { email, name: rawName ?? null, passwordHash, role: "admin" },
    });
    console.log(`OK: usuario admin ${email} creado.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
