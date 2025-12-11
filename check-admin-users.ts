import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });

    console.log('\n=== ADMIN USERS ===');
    console.log('Total admin users found:', admins.length);
    console.log('Admin users:', JSON.stringify(admins, null, 2));

    // Check all notifications for admin users
    if (admins.length > 0) {
      const adminIds = admins.map(a => a.id);
      const notifications = await prisma.notification.findMany({
        where: { userId: { in: adminIds } },
        select: {
          id: true,
          userId: true,
          type: true,
          message: true,
          messageKey: true,
          routeKey: true,
          role: true,
          isRead: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      console.log('\n=== ADMIN NOTIFICATIONS ===');
      console.log('Total notifications for admins:', notifications.length);
      console.log('Recent notifications:', JSON.stringify(notifications, null, 2));
    }

    // Check all users by role
    const allRoles = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    console.log('\n=== USER ROLES SUMMARY ===');
    console.log(JSON.stringify(allRoles, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
