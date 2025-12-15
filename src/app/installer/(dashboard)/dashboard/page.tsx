'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstallerDashboardPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/installer/leads');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
