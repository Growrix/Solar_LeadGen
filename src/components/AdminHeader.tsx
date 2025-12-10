"use client";
import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

const AdminHeader: React.FC = () => {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__left">
        {/* Empty - Admin header has no left content */}
      </div>
      <div className="dashboard-header__right">
        <ThemeSwitcher />
      </div>
    </header>
  );
};

export default AdminHeader;