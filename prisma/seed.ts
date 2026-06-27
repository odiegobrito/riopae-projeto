import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  const password = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { email: 'admin@riopae.local' },
    update: {
      name: 'Administrador RioPae',
      password,
      role: UserRole.ADMIN,
    },
    create: {
      name: 'Administrador RioPae',
      email: 'admin@riopae.local',
      password,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@riopae.local' },
    update: {
      name: 'Gerente RioPae',
      password,
      role: UserRole.MANAGER,
    },
    create: {
      name: 'Gerente RioPae',
      email: 'manager@riopae.local',
      password,
      role: UserRole.MANAGER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'operator@riopae.local' },
    update: {
      name: 'Operador RioPae',
      password,
      role: UserRole.OPERATOR,
    },
    create: {
      name: 'Operador RioPae',
      email: 'operator@riopae.local',
      password,
      role: UserRole.OPERATOR,
    },
  });

  console.log('Usuários de teste da RioPae criados com sucesso.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
