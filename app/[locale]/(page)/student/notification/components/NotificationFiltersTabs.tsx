"use client";

import { useTranslations } from "next-intl";
import { Tabs } from "@/app/components/ui/tabs";
import { NotificationType } from "@/lib/types/notification";
import { notificationFilters } from "@/lib/constants/notification";
import { UnreadCounts } from "@/lib/features/notifications/hooks/useUnreadCounts";

interface NotificationFiltersTabsProps {
  activeFilter: NotificationType;
  unreadCounts: UnreadCounts;
  loading: boolean;
  isFetching?: boolean;
  onFilterChange: (filter: NotificationType) => void;
  translationNamespace?: string;
}

export function NotificationFiltersTabs({ 
  activeFilter, 
  unreadCounts, 
  loading,
  isFetching = false,
  onFilterChange,
  translationNamespace = "student.notification"
}: NotificationFiltersTabsProps) {
  const t = useTranslations(translationNamespace);
  
  const items = notificationFilters.map(filter => {
    const count = unreadCounts[filter.key];
    
    return {
      key: filter.key,
      label: t(`filters.${filter.key}`),
      badge: isFetching && count === 0
        ? <span className="inline-flex h-4 w-6 animate-pulse rounded-full bg-gray-300" />
        : count > 0
          ? count
          : undefined,
    };
  });

  return (
    <Tabs
      items={items}
      activeKey={activeFilter}
      onChange={onFilterChange}
      disabled={loading}
    />
  );
}
