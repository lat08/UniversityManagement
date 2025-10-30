'use client';

import { useState, useEffect } from "react";
import { Sidebar } from "@/app/components/ui/sidebar";
import { Header } from "@/app/components/header/header";
import RequireRoleAuth from "@/app/(auth)/components/RequireRoleAuth";
import { cn } from "@/lib/utils/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <RequireRoleAuth allowedRoles={['Admin_Principal']} redirectTo="/admin/login">
      <div className="flex h-screen overflow-hidden bg-[var(--bg-secondary)]" suppressHydrationWarning>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          variant="admin"
        />

        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-300",
            "ml-0 lg:ml-20",
            !isSidebarCollapsed && "lg:ml-64",
          )}
        >
          <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </RequireRoleAuth>
  );
}
