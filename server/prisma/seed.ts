import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const roles = ['root', 'admin', 'operador', 'lector'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const email = process.env.ROOT_EMAIL || 'admin@demo.com';
  const password = process.env.ROOT_PASSWORD || '123456';
  const nombre = process.env.ROOT_NAME || 'Root';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await argon2.hash(password);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        nombre,
        roles: {
          create: [{ role: { connect: { name: 'root' } } }],
        },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
