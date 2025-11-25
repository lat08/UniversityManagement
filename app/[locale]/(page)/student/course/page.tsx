"use client"

import { useTranslations } from "next-intl";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { CoursesContent } from "./components/content/CoursesContent"

export default function CoursesPage() {
  const t = useTranslations('student.course');
  usePageTitle(t('title'));
  return <CoursesContent />
}