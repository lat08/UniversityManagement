"use client";

import { useTranslations } from "next-intl";
import { BellOff } from "lucide-react";
import { NotificationType } from "@/lib/types/notification";

interface EmptyStateProps {
  activeFilter: NotificationType;
  role?: string;
}

export function EmptyState({ activeFilter, role = "Student" }: EmptyStateProps) {
  const translationNamespace = role === "Instructor" ? "instructor.notification.empty" : "student.notification.empty";
  const t = useTranslations(translationNamespace);
  
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BellOff className="h-16 w-16 text-[var(--muted-foreground)] mb-4" />
      <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">
        {t('title')}
      </p>
      <p className="text-sm text-[var(--text-muted)]">
        {activeFilter === "all" 
          ? t('noNotifications') 
          : t('noNotificationsInCategory')}
      </p>
    </div>
  );
}
