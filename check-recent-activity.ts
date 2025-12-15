import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRecentActivity() {
  try {
    // Check recent bids (should trigger admin notifications)
    const recentBids = await prisma.bid.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        status: true,
        leadId: true,
        installerId: true,
        purchasedAt: true
      }
    });

    console.log('\n=== RECENT BIDS ===');
    console.log(JSON.stringify(recentBids, null, 2));

    // Check recent lead purchases (should trigger admin notifications)
    const recentPurchases = await prisma.lead.findMany({
      where: { status: 'PURCHASED' },
      take: 5,
      orderBy: { purchasedAt: 'desc' },
      select: {
        id: true,
        purchasedAt: true,
        installerId: true,
        homeownerId: true,
        status: true
      }
    });

    console.log('\n=== RECENT LEAD PURCHASES ===');
    console.log(JSON.stringify(recentPurchases, null, 2));

    // Check all notifications (to see what's being created)
    const allNotifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        type: true,
        message: true,
        messageKey: true,
        routeKey: true,
        role: true,
        createdAt: true
      }
    });

    console.log('\n=== RECENT NOTIFICATIONS (ALL ROLES) ===');
    console.log('Total notifications:', allNotifications.length);
    console.log(JSON.stringify(allNotifications, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentActivity();
