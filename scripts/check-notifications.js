const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNotifications() {
  try {
    const count = await prisma.notification.count();
    console.log('✅ Total notifications in database:', count);
    
    if (count > 0) {
      const recent = await prisma.notification.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      console.log('\n📋 Recent notifications:');
      for (const n of recent) {
        const user = await prisma.user.findUnique({
          where: { id: n.userId },
          select: { name: true, email: true, role: true }
        });
        console.log(`  - [${n.type}] ${n.title} → ${user?.name || 'Unknown'} (${user?.role || 'N/A'})`);
        console.log(`    Read: ${n.isRead}, Created: ${n.createdAt.toISOString()}`);
      }
      
      const unreadCount = await prisma.notification.count({
        where: { isRead: false }
      });
      console.log(`\n📊 Statistics:`);
      console.log(`  Total: ${count}`);
      console.log(`  Unread: ${unreadCount}`);
      console.log(`  Read: ${count - unreadCount}`);
    } else {
      console.log('⚠️  No notifications found in database');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();
