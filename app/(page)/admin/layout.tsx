import { ReactNode, Suspense } from "react"
import RequireRoleAuth from "@/app/(auth)/components/RequireRoleAuth"
import { SidebarShell } from "./components/SidebarShell";
import { AdminLayoutSkeleton } from "./components/AdminLayoutSkeleton";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireRoleAuth allowedRoles={['Admin', 'Admin_Principal']} redirectTo="/admin/login">
      <SidebarShell>
        <Suspense fallback={<AdminLayoutSkeleton />}>
          {children}
        </Suspense>
      </SidebarShell>
    </RequireRoleAuth>
  );
}
