'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/app/components/ui/badge';
import { REGULATION_STATUS_META } from '@/lib/constants/regulations';
import { RegulationStatus } from '@/lib/types/regulation';
import { cn } from '@/lib/utils/utils';

interface RegulationStatusBadgeProps {
  readonly status: RegulationStatus;
}

export const RegulationStatusBadge = ({ status }: RegulationStatusBadgeProps) => {
  const t = useTranslations('admin.regulations');
  const statusMeta = REGULATION_STATUS_META[status];
  const badgeClass = statusMeta?.badgeClass ?? 'bg-gray-100 text-gray-600 ring-gray-200';
  const label =
    statusMeta?.labelKey !== undefined
      ? t(statusMeta.labelKey)
      : status ?? t('status.unknown', { defaultValue: 'Unknown' });

  return (
    <Badge
      className={cn(
        'pointer-events-none select-none border border-transparent px-2.5 py-0.5 text-xs font-semibold ring-1',
        badgeClass,
      )}
    >
      {label}
    </Badge>
  );
};


