import { prisma } from '@/lib/prisma';

export async function createNewsAuditLog(data: {
  itemId?: string;
  userId?: string;
  action: string;
  metadata?: any;
}) {
  return await prisma.newsAuditLog.create({
    data: {
      newsItemId: data.itemId,
      userId: data.userId,
      action: data.action,
      metadata: data.metadata || {},
    },
  });
}
