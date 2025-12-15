import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestNotification() {
  await prisma.notification.delete({ 
    where: { id: 'cmj1axy280000i1d4jkqgfr7g' } 
  });
  console.log('Test notification deleted');
  await prisma.$disconnect();
}

deleteTestNotification();
