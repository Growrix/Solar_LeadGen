import { AdminPostEditorClient } from '@/components/admin/blog/editor/AdminPostEditorClient';

export const dynamic = 'force-dynamic';

export default function AdminBlogEditPage({ params }: { params: { id: string } }) {
  return <AdminPostEditorClient id={params.id} />;
}
