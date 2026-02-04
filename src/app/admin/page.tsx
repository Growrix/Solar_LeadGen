import AdminSignIn from '@/components/AdminSignIn';
import { CenteredShell } from '@/ds';

/**
 * Admin Login Page
 * Route: /admin
 * Public access - shows login form only
 * After successful login, redirects to /admin/dashboard
 */
export default function AdminPage() {
  return (
    <CenteredShell>
      <AdminSignIn embedded />
    </CenteredShell>
  );
}
