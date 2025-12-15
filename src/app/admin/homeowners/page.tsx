import React from"react";
import AdminHomeownersList from"@/components/AdminHomeownersList";

export default function AdminHomeownersPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Title & Subtitle */}
      <div className="mb-8">
        <h1 className="text-heading-1 text-foreground mb-2">Homeowners Management</h1>
        <p className="text-heading-4 text-muted-foreground">View and manage all registered homeowners.</p>
      </div>
      <AdminHomeownersList />
    </div>
  );
}
