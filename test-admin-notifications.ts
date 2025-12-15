import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAdminNotifications() {
  try {
    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@solarmatch.com' },
      select: { id: true, email: true, role: true }
    });

    console.log('\n=== ADMIN USER ===');
    console.log(JSON.stringify(admin, null, 2));

    if (admin) {
      // Create a test notification manually
      const testNotification = await prisma.notification.create({
        data: {
          userId: admin.id, // Use ID, not email!
          type: 'BID_SUBMITTED',
          title: 'TEST: Manual admin notification',
          message: 'TEST: Manual admin notification',
          messageKey: 'admin.bid.submitted',
          routeKey: 'admin.dashboard',
          routeParams: { leadId: 'test-lead-id', bidId: 'test-bid-id' },
          role: 'ADMIN',
          isRead: false
        }
      });

      console.log('\n=== TEST NOTIFICATION CREATED ===');
      console.log(JSON.stringify(testNotification, null, 2));

      // Query back notifications for this admin
      const adminNotifications = await prisma.notification.findMany({
        where: { userId: admin.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      console.log('\n=== ADMIN NOTIFICATIONS (by userId) ===');
      console.log('Count:', adminNotifications.length);
      console.log(JSON.stringify(adminNotifications, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminNotifications();
