'use client';

import { Badge } from '@/app/components/ui/badge';
import { REGULATION_STATUS_META } from '@/lib/constants/regulations';
import { RegulationStatus } from '@/lib/types/regulation';
import { cn } from '@/lib/utils/utils';

interface RegulationStatusBadgeProps {
  readonly status: RegulationStatus;
}

export const RegulationStatusBadge = ({ status }: RegulationStatusBadgeProps) => {
  const statusMeta = REGULATION_STATUS_META[status];

  return (
    <Badge
      className={cn(
        'pointer-events-none select-none border border-transparent px-2.5 py-0.5 text-xs font-semibold ring-1',
        statusMeta.badgeClass,
      )}
    >
      {statusMeta.label}
    </Badge>
  );
};


