import { prisma } from '../src/lib/prisma';

async function getTestUserIds() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['homeowner@test.com', 'installer@test.com']
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });

    console.log('\n=== Test User IDs ===');
    users.forEach(user => {
      console.log(`\n${user.role}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  ID: ${user.id}`);
    });
    console.log('\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error fetching user IDs:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

getTestUserIds();
