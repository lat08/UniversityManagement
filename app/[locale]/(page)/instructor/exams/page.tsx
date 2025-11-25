"use client"

import { useTranslations } from "next-intl";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { ExamsContent } from "./components/ExamsContent"

export default function ExamsPage() {
  const t = useTranslations('instructor.exams');
  usePageTitle(t('title'));
  return <ExamsContent />
}

