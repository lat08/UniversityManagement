"use client";

import { useTranslations } from "next-intl";
import { BellOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  role?: string;
}

export function ErrorState({ error, onRetry, role = "Student" }: ErrorStateProps) {
  const translationNamespace = role === "Instructor" ? "instructor.notification.error" : "student.notification.error";
  const t = useTranslations(translationNamespace);
  
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BellOff className="h-16 w-16 text-[var(--error)] mb-4" />
      <p className="text-lg font-medium text-[var(--error)] mb-2">
        {t('title')}
      </p>
      <p className="text-sm text-[var(--text-muted)] mb-4">{error}</p>
      <Button onClick={onRetry} variant="outline">
        {t('retry')}
      </Button>
    </div>
  );
}
