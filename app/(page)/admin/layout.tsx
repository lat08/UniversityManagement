'use client';

import { RequireRoleAuth } from '@/app/(auth)/components/RequireRoleAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRoleAuth 
      allowedRoles={['Admin']} 
      redirectTo="/admin/login"
    >
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </RequireRoleAuth>
  );
}
