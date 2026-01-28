import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Blog/Media test data...');

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    throw new Error('No ADMIN user found. Run `npm run seed:admin` first.');
  }

  const author = await prisma.blogAuthor.upsert({
    where: { email: 'blog.author@solarmatch.test' },
    update: {
      name: 'SolarMatch Blog Author',
      status: 'ACTIVE',
      userId: admin.id,
    },
    create: {
      name: 'SolarMatch Blog Author',
      email: 'blog.author@solarmatch.test',
      bio: 'Seeded blog author for local testing.',
      avatarUrl: '',
      status: 'ACTIVE',
      userId: admin.id,
      socialLinks: {
        website: 'https://example.com',
        twitter: 'https://x.com/example',
      },
    },
  });

  const seedPost = await prisma.blogPost.upsert({
    where: { slug: 'seed-post' },
    update: {
      title: 'Seed Post',
      excerpt: 'Seeded post for local testing.',
      content: '<p>This is a seeded blog post.</p>',
      status: 'DRAFT',
      blogAuthorId: author.id,
    },
    create: {
      title: 'Seed Post',
      slug: 'seed-post',
      excerpt: 'Seeded post for local testing.',
      content: '<p>This is a seeded blog post.</p>',
      status: 'DRAFT',
      authorId: admin.id,
      blogAuthorId: author.id,
      seoTitle: 'Seed Post',
      seoDescription: 'Seeded blog post for local testing.',
    },
  });

  const existingComment = await prisma.blogComment.findFirst({
    where: {
      postId: seedPost.id,
      authorEmail: 'commenter@solarmatch.test',
      content: 'Seed comment for moderation testing.',
    },
  });

  if (!existingComment) {
    await prisma.blogComment.create({
      data: {
        postId: seedPost.id,
        authorName: 'Seed Commenter',
        authorEmail: 'commenter@solarmatch.test',
        content: 'Seed comment for moderation testing.',
        status: 'PENDING',
        ipAddress: '127.0.0.1',
        userAgent: 'seed-script',
      },
    });
  }

  const rootFolderName = 'Seed Media';
  let rootFolder = await prisma.mediaFolder.findFirst({
    where: { parentId: null, name: rootFolderName },
  });
  if (!rootFolder) {
    rootFolder = await prisma.mediaFolder.create({
      data: { name: rootFolderName, parentId: null },
    });
  }

  const assets = [
    {
      s3Key: 'media/seed/hero.jpg',
      name: 'hero.jpg',
      type: 'IMAGE' as const,
      mimeType: 'image/jpeg',
      size: 123456,
      url: 'https://example.com/media/seed/hero.jpg',
      dimensions: '1200x800',
      altText: 'Seed hero image',
      caption: 'Seed asset for local testing',
      tags: ['seed', 'hero'],
    },
    {
      s3Key: 'media/seed/brochure.pdf',
      name: 'brochure.pdf',
      type: 'DOCUMENT' as const,
      mimeType: 'application/pdf',
      size: 456789,
      url: 'https://example.com/media/seed/brochure.pdf',
      dimensions: null,
      altText: 'Seed brochure PDF',
      caption: 'Seed PDF for local testing',
      tags: ['seed', 'pdf'],
    },
  ];

  for (const a of assets) {
    await prisma.mediaAsset.upsert({
      where: { s3Key: a.s3Key },
      update: {
        name: a.name,
        type: a.type,
        url: a.url,
        size: a.size,
        dimensions: a.dimensions ?? undefined,
        mimeType: a.mimeType,
        altText: a.altText,
        caption: a.caption,
        tags: a.tags,
        folderId: rootFolder.id,
        status: 'ACTIVE',
        uploadedById: admin.id,
      },
      create: {
        name: a.name,
        type: a.type,
        url: a.url,
        s3Key: a.s3Key,
        size: a.size,
        dimensions: a.dimensions ?? undefined,
        mimeType: a.mimeType,
        altText: a.altText,
        caption: a.caption,
        tags: a.tags,
        folderId: rootFolder.id,
        status: 'ACTIVE',
        uploadedById: admin.id,
      },
    });
  }

  console.log('✅ Seed complete');
  console.log(`- BlogAuthor: ${author.email}`);
  console.log(`- BlogPost: /blog/${seedPost.slug}`);
  console.log(`- MediaFolder: ${rootFolder.name}`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
