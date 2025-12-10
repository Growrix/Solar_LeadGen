// ============================================================================
// ADMIN HOMEOWNERS LIST API
// ============================================================================
// GET /api/admin/homeowners
// Lists all homeowners with search, filters, and pagination (ADMIN only)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || '';
    const postcodeFilter = searchParams.get('postcode') || '';
    const statusFilter = searchParams.get('status') || '';
    const fromDate = searchParams.get('from') || '';
    const toDate = searchParams.get('to') || '';
    const quotaFilter = searchParams.get('quota') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '25', 10)));

    const escapeLikePattern = (input: string) => input.replace(/[\\%_]/g, (char) => `\\${char}`);

    const conditions: Prisma.Sql[] = [Prisma.sql`"role" = 'HOMEOWNER'`];

    if (q.trim()) {
      const searchValue = `%${escapeLikePattern(q.trim())}%`;
      conditions.push(
        Prisma.sql`(
        "name" ILIKE ${searchValue} ESCAPE '\\' OR
        "email" ILIKE ${searchValue} ESCAPE '\\' OR
        "phone" ILIKE ${searchValue} ESCAPE '\\' OR
        "postcode" ILIKE ${searchValue} ESCAPE '\\'
        )`
      );
    }

    if (postcodeFilter.trim()) {
      const postcodeValue = `%${escapeLikePattern(postcodeFilter.trim())}%`;
      conditions.push(Prisma.sql`"postcode" ILIKE ${postcodeValue} ESCAPE '\\'`);
    }

    if (statusFilter === 'active') {
      conditions.push(Prisma.sql`"isActive" = true`);
    } else if (statusFilter === 'inactive') {
      conditions.push(Prisma.sql`"isActive" = false`);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      if (Number.isNaN(from.getTime())) {
        return NextResponse.json({ error: 'Invalid"from" date format' }, { status: 400 });
      }
      conditions.push(Prisma.sql`"createdAt" >= ${from}`);
    }

    if (toDate) {
      const to = new Date(toDate);
      if (Number.isNaN(to.getTime())) {
        return NextResponse.json({ error: 'Invalid"to" date format' }, { status: 400 });
      }
      to.setHours(23, 59, 59, 999);
      conditions.push(Prisma.sql`"createdAt" <= ${to}`);
    }

    if (quotaFilter === 'available') {
      conditions.push(Prisma.sql`("leadSubmissionLimit" -"leadSubmissionCount") > 0`);
    } else if (quotaFilter === 'exhausted') {
      conditions.push(Prisma.sql`("leadSubmissionLimit" -"leadSubmissionCount") <= 0`);
    }

    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.sql``;

    const offset = (page - 1) * pageSize;

    const totalResult = await prisma.$queryRaw<Array<{ total: number }>>(
      Prisma.sql`SELECT COUNT(*)::int AS total FROM"users" ${whereClause}`
    );

    const itemsRaw = await prisma.$queryRaw<Array<{
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      postcode: string | null;
      createdAt: Date;
      isActive: boolean;
      phoneVerified: boolean;
      leadSubmissionCount: number;
      leadSubmissionLimit: number;
      signupIp: string | null;
      primaryAddress: string | null;
      residentialLeadCount: number;
      commercialLeadCount: number;
    }>>(
      Prisma.sql`
        SELECT
        u."id",
        u."name",
        u."email",
        u."phone",
        (
          SELECT l."postcode"
          FROM "leads" l
          WHERE l."homeownerId" = u."id" AND l."postcode" IS NOT NULL
          ORDER BY l."createdAt" ASC
          LIMIT 1
        ) as "postcode",
        u."createdAt",
        u."isActive",
        u."phoneVerified",
        u."leadSubmissionCount",
        u."leadSubmissionLimit",
        u."signupIp",
        (
          SELECT l."address"
          FROM "leads" l
          WHERE l."homeownerId" = u."id" AND l."address" IS NOT NULL
          ORDER BY l."createdAt" DESC
          LIMIT 1
        ) as "primaryAddress",
        (
          SELECT COUNT(*)::int
          FROM "leads" l
          WHERE l."homeownerId" = u."id" AND l."propertyType" ILIKE '%residential%'
        ) as "residentialLeadCount",
        (
          SELECT COUNT(*)::int
          FROM "leads" l
          WHERE l."homeownerId" = u."id" AND l."propertyType" ILIKE '%commercial%'
        ) as "commercialLeadCount"
        FROM"users" u
        ${whereClause}
        ORDER BY u."createdAt" DESC
        OFFSET ${offset}
        LIMIT ${pageSize}
      `
    );

    const total = totalResult[0]?.total ?? 0;

    const items = itemsRaw.map((item) => ({
      ...item,
      createdAt: item.createdAt,
      remainingLeadAllowance: Math.max(item.leadSubmissionLimit - item.leadSubmissionCount, 0),
    }));

    return NextResponse.json(
      {
        total,
        page,
        pageSize,
        items,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching homeowners list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homeowners' },
      { status: 500 }
    );
  }
}
