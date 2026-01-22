import { ContentManagerHub } from '@/components/admin/blog/content-manager/ContentManagerHub';

export default function AdminBlogContentManagerPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-heading-1 text-foreground mb-2">Content Manager</h1>
        <p className="text-heading-4 text-muted-foreground">
          Manage posts, categories, and tags.
        </p>
      </div>

      <ContentManagerHub />
    </div>
  );
}
