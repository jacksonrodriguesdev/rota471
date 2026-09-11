import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function DashboardLayout() {
  return (
    <div className="dark bg-surface-container-lowest min-h-screen">
      <AdminHeader />
      <AdminSidebar />
      <div className="md:ml-72 pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
