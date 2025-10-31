"use client"

import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { MaterialsContent } from "./components/MaterialsContent"

export default function MaterialsPage() {
  usePageTitle('Bài giảng & Giáo trình');
  return <MaterialsContent />
}

