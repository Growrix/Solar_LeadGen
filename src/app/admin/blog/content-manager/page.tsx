import { Suspense } from 'react';
import { ContentManagerHub } from '@/components/admin/blog/content-manager/ContentManagerHub';

export const dynamic = 'force-dynamic';

export default function AdminBlogContentManagerPage() {
  return (
    <Suspense fallback={null}>
      <ContentManagerHub />
    </Suspense>
  );
}
