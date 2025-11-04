"use client";

import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Loader2 className="h-16 w-16 text-[var(--primary)] mb-4 animate-spin" />
      <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">
        Đang tải thông báo...
      </p>
    </div>
  );
}
