import React from 'react';
import { AdminGuard } from './components/admin/AdminGuard';
import AdminLayout from './components/admin/AdminLayout';

const AdminApp: React.FC = () => (
  <AdminGuard>
    <AdminLayout />
  </AdminGuard>
);

export default AdminApp;
