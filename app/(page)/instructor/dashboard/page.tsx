"use client"

import { usePageTitle } from "@/lib/hooks/usePageTitle";
import DashboardContent from "@/app/(page)/student/dashboard/components/content/dashboardContent"

export default function InstructorDashboardPage() {
  usePageTitle('Bảng điều khiển');
  return <DashboardContent />
}
