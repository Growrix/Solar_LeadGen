import AdminSignIn from '@/components/AdminSignIn';

/**
 * Admin Login Page
 * Route: /admin
 * Public access - shows login form only
 * After successful login, redirects to /admin/dashboard
 */
export default function AdminPage() {
  return <AdminSignIn />;
}
