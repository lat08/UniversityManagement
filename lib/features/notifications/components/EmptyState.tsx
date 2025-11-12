"use client";

import { BellOff } from "lucide-react";
import { NotificationType } from "@/lib/types/notification";

interface EmptyStateProps {
  activeFilter: NotificationType;
}

export function EmptyState({ activeFilter }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BellOff className="h-16 w-16 text-[var(--muted-foreground)] mb-4" />
      <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">
        Không có thông báo
      </p>
      <p className="text-sm text-[var(--text-muted)]">
        {activeFilter === "all" 
          ? "Bạn chưa có thông báo nào" 
          : "Không có thông báo trong danh mục này"}
      </p>
    </div>
  );
}
