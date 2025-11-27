"use client";

import { useTranslations } from "next-intl";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { RegulationsPage } from "@/app/components/regulations";

const InstructorRegulationsPage = () => {
  const t = useTranslations('instructor.regulations');
  usePageTitle(t('title'));

  return (
    <RegulationsPage
      pageTitle={t('title')}
      description={t('description')}
      noticeText={t('noticeText')}
    />
  );
};

export default InstructorRegulationsPage;

