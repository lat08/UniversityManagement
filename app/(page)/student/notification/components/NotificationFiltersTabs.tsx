"use client";

import { Tabs } from "@/app/components/ui/tabs";
import { NotificationType } from "@/lib/types/notification";
import { notificationFilters } from "@/lib/constants/notification";

interface UnreadCounts {
  all: number;
  event: number;
  tuition: number;
  schedule: number;
  important: number;
}

interface NotificationFiltersTabsProps {
  activeFilter: NotificationType;
  unreadCounts: UnreadCounts;
  loading: boolean;
  onFilterChange: (filter: NotificationType) => void;
}

export function NotificationFiltersTabs({ 
  activeFilter, 
  unreadCounts, 
  loading, 
  onFilterChange 
}: NotificationFiltersTabsProps) {
  return (
    <Tabs
      items={notificationFilters.map(filter => ({
        key: filter.key,
        label: filter.label,
        badge: unreadCounts[filter.key] > 0 ? unreadCounts[filter.key] : undefined,
      }))}
      activeKey={activeFilter}
      onChange={onFilterChange}
      disabled={loading}
    />
  );
}
