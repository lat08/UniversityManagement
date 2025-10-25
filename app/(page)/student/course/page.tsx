"use client"

import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { CoursesContent } from "./components/content/CoursesContent"

export default function CoursesPage() {
  usePageTitle('Khóa học');
  return <CoursesContent />
}