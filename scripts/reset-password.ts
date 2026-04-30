import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const [, , rawEmail, rawPassword] = process.argv;
  if (!rawEmail || !rawPassword) {
    console.error("Uso: npm run auth:reset -- <email> <nuevaClave>");
    console.error("Ej:  npm run auth:reset -- eduardo.loaiza@usatusubsidio.cl miClave123");
    process.exit(1);
  }

  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`Email inválido: ${rawEmail}`);
    process.exit(1);
  }
  if (rawPassword.length < 8) {
    console.error("La clave debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const db = new PrismaClient();
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`No existe ningún usuario con email ${email}.`);
      console.error("Si quieres crearlo, usa la pantalla de /register o agrega un flag --create al script.");
      process.exit(2);
    }

    const passwordHash = await bcrypt.hash(rawPassword, 10);
    await db.user.update({ where: { id: user.id }, data: { passwordHash } });
    console.log(`OK: clave actualizada para ${email}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
