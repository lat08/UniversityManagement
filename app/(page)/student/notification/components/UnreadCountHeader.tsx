"use client";

import { CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface UnreadCountHeaderProps {
  unreadCount: number;
  markingAllAsRead: boolean;
  onMarkAllAsRead: () => void;
}

export function UnreadCountHeader({ 
  unreadCount, 
  markingAllAsRead, 
  onMarkAllAsRead 
}: UnreadCountHeaderProps) {
  if (unreadCount === 0) return null;

  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-[var(--text-secondary)]">
        {unreadCount} thông báo chưa đọc
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
            Đang xử lý...
          </>
        ) : (
          <>
            <CheckCheck className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </>
        )}
      </Button>
    </div>
  );
}
