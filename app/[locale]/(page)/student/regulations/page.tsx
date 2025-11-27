"use client";

import { useTranslations } from "next-intl";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { RegulationsPage } from "@/app/components/regulations";

const StudentRegulationsPage = () => {
  const t = useTranslations('student.regulations');
  usePageTitle(t('pageTitle'));

  return (
    <RegulationsPage
      pageTitle={t('pageTitle')}
      description={t('description')}
      noticeText={t('noticeText')}
    />
  );
};

export default StudentRegulationsPage;

