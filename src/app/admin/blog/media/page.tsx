import { MediaLibrary } from '@/components/admin/blog/media/MediaLibrary';

export default function AdminBlogMediaLibraryPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-heading-1 text-foreground mb-2">Media Library</h1>
        <p className="text-heading-4 text-muted-foreground">
          Upload and manage blog assets.
        </p>
      </div>

      <MediaLibrary />
    </div>
  );
}
