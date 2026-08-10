import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password@123', 10);

  const users = [
    { name: 'Admin User', email: 'admin@erp.com', role: 'Admin' as const },
    { name: 'Sales User', email: 'sales@erp.com', role: 'Sales' as const },
    { name: 'Warehouse User', email: 'warehouse@erp.com', role: 'Warehouse' as const },
    { name: 'Accounts User', email: 'accounts@erp.com', role: 'Accounts' as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash: password,
        role: u.role,
      },
    });
    console.log(`Seeded: ${u.email} / Password@123 (${u.role})`);
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