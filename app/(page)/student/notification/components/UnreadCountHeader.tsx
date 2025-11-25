"use client";

import { useTranslations } from "next-intl";
import { CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface UnreadCountHeaderProps {
  unreadCount: number;
  markingAllAsRead: boolean;
  onMarkAllAsRead: () => void;
  role?: string;
}

export function UnreadCountHeader({ 
  unreadCount, 
  markingAllAsRead, 
  onMarkAllAsRead,
  role = "Student"
}: UnreadCountHeaderProps) {
  const translationNamespace = role === "Instructor" ? "instructor.notification" : "student.notification";
  const t = useTranslations(translationNamespace);
  
  if (unreadCount === 0) return null;

  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-[var(--text-secondary)]">
        {t('unreadCount', { count: unreadCount })}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onMarkAllAsRead}
        disabled={markingAllAsRead}
        className="gap-2"
      >
        {markingAllAsRead ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('markAllAsRead.processing')}
          </>
        ) : (
          <>
            <CheckCheck className="h-4 w-4" />
            {t('markAllAsRead.button')}
          </>
        )}
      </Button>
    </div>
  );
}
