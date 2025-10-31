"use client"

import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { ExamsContent } from "./components/ExamsContent"

export default function ExamsPage() {
  usePageTitle('Đề thi');
  return <ExamsContent />
}

