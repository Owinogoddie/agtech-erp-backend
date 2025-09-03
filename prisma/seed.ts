import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@agtech.com' },
    update: {},
    create: {
      email: 'admin@agtech.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample farmers
  const farmer1Password = await bcrypt.hash('farmer123', 10);

  const farmer1 = await prisma.user.upsert({
    where: { email: 'john@agtech.com' },
    update: {},
    create: {
      email: 'john@agtech.com',
      password: farmer1Password,
      role: Role.FARMER,
      farmer: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          address: '123 Farm Road, Rural County',
        },
      },
    },
    include: { farmer: true },
  });

  const farmer2Password = await bcrypt.hash('farmer123', 10);

  const farmer2 = await prisma.user.upsert({
    where: { email: 'jane@agtech.com' },
    update: {},
    create: {
      email: 'jane@agtech.com',
      password: farmer2Password,
      role: Role.FARMER,
      farmer: {
        create: {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1987654321',
          address: '456 Agricultural Ave, Farm Valley',
        },
      },
    },
    include: { farmer: true },
  });

  console.log('✅ Sample farmers created:', farmer1.email, farmer2.email);

  // Create sample crops
  if (farmer1.farmer && farmer2.farmer) {
    await prisma.crop.createMany({
      data: [
        {
          name: 'Corn',
          type: 'CEREALS',
          quantity: 500.5,
          unit: 'kg',
          farmerId: farmer1.farmer.id,
        },
        {
          name: 'Tomatoes',
          type: 'VEGETABLES',
          quantity: 200.0,
          unit: 'kg',
          farmerId: farmer1.farmer.id,
        },
        {
          name: 'Wheat',
          type: 'CEREALS',
          quantity: 1000.0,
          unit: 'kg',
          farmerId: farmer2.farmer.id,
        },
        {
          name: 'Carrots',
          type: 'VEGETABLES',
          quantity: 150.0,
          unit: 'kg',
          farmerId: farmer2.farmer.id,
        },
      ],
    });

    console.log('✅ Sample crops created');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
