
import React from 'react';
import AdminLayout from './AdminLayout';
import AdminEditor from './AdminEditor';
import AdminPreview from './AdminPreview';
import BlogEngine from './BlogEngine';
import BlogEngineHub from './BlogEngineHub';
import AdminMediaLibrary from './AdminMediaLibrary';
import AdminCommentsList from './AdminCommentsList';
import AdminOverview from './AdminOverview';

interface AdminDashboardProps {
  currentRoute: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentRoute }) => {
  // Logic to determine which component to render based on the route

  // 1. Preview Route (No Layout, resembles public site)
  const previewMatch = currentRoute.match(/^#\/admin\/blog\/([^/]+)\/preview$/);
  if (previewMatch) {
    return <AdminPreview id={previewMatch[1]} />;
  }

  // 2. Editor Routes (Full screen for distraction-free editing)
  // New Post
  if (currentRoute === '#/admin/blog/new') {
    return <AdminEditor id="new" onBack={() => window.location.hash = '#/admin/blog'} />;
  }
  
  // Edit Existing Post
  const editorMatch = currentRoute.match(/^#\/admin\/blog\/([^/]+)$/);
  // Ensure we don't treat 'categories', 'tags', 'engine', 'media', 'comments', 'trash' as a post ID
  if (editorMatch && !['categories', 'tags', 'engine', 'media', 'comments', 'trash'].includes(editorMatch[1])) {
     const possibleId = editorMatch[1];
     if (possibleId) {
       return <AdminEditor id={possibleId} onBack={() => window.location.hash = '#/admin/blog'} />;
     }
  }

  // 3. Engine Hub
  if (currentRoute === '#/admin/blog/engine') {
     return (
       <AdminLayout currentRoute={currentRoute}>
         <BlogEngineHub />
       </AdminLayout>
     );
  }

  // 4. Media Library
  if (currentRoute === '#/admin/blog/media') {
    return (
      <AdminLayout currentRoute={currentRoute}>
        <AdminMediaLibrary />
      </AdminLayout>
    );
  }

  // 5. Comments
  if (currentRoute === '#/admin/blog/comments') {
    return (
      <AdminLayout currentRoute={currentRoute}>
        <AdminCommentsList />
      </AdminLayout>
    );
  }

  // 6. Blog Engine (Tabbed Views for Content Lists)
  // Matches #/admin/blog, #/admin/blog/categories, #/admin/blog/tags, #/admin/blog/trash
  if (currentRoute.startsWith('#/admin/blog')) {
    return (
      <AdminLayout currentRoute={currentRoute}>
        <BlogEngine currentRoute={currentRoute} />
      </AdminLayout>
    );
  }

  // 7. Dashboard Overview (Default fallback for /admin)
  return (
    <AdminLayout currentRoute={currentRoute}>
      <AdminOverview />
    </AdminLayout>
  );
};

export default AdminDashboard;
