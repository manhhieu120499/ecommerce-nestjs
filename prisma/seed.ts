import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { RoleName } from '../src/shared/constants/roles.constant.js';
import { PrismaClientUnknownRequestError } from '@prisma/client/runtime/client';
import 'dotenv/config';
import { HashingService } from '../src/shared/services/hashing.service.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

try {
  prisma.$connect();
} catch (err) {
  if (err instanceof PrismaClientUnknownRequestError) {
    console.log('Connect database failed');
    process.exit(1);
  }
}

async function main() {
  const roleCount = await prisma.role.count();

  if (roleCount > 0) {
    return Promise.reject('Roles already exist');
  }

  const roles = await prisma.$transaction([
    prisma.role.create({
      data: {
        name: RoleName.Admin,
        description: 'administrator',
      },
    }),
    prisma.role.create({
      data: {
        name: RoleName.Client,
        description: 'client who can buy product',
      },
    }),
    prisma.role.create({
      data: {
        name: RoleName.Seller,
        description: 'seller who can provide product',
      },
    }),
  ]);

  const hashPassword = new HashingService().hash(process.env.ADMIN_PASSWORD!);

  const adminUser = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL!,
      password: hashPassword,
      phoneNumber: process.env.ADMIN_PHONENUMBER!,
      name: process.env.ADMIN_NAME!,
      roleId: roles[0].id, // role admin
    },
  });

  return Promise.resolve({ roles, adminUser });
}

main()
  .then(({ roles, adminUser }) => {
    if (roles && adminUser) console.log('Seed data successfully');
  })
  .catch((err) => {
    console.log('Seed data failed because:', err);
  });
