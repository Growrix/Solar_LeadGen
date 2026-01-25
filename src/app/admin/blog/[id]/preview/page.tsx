import { AdminPostPreviewClient } from '@/components/admin/blog/editor/AdminPostPreviewClient';

export const dynamic = 'force-dynamic';

export default function AdminBlogPreviewPage({ params }: { params: { id: string } }) {
  return <AdminPostPreviewClient id={params.id} />;
}
