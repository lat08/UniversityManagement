'use client';

import { MoreVertical, Eye, CheckCircle, XCircle, Ban } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Button } from '@/app/components/ui/button';
import type { RoomRequestRecord } from '@/lib/types/room-request';

interface RoomRequestActionsMenuProps {
  readonly request: RoomRequestRecord;
  readonly onView: () => void;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
  readonly onCancel?: () => void;
}

export const RoomRequestActionsMenu = ({
  request,
  onView,
  onApprove,
  onReject,
  onCancel,
}: RoomRequestActionsMenuProps) => {
  const t = useTranslations('admin.roomRequests.list.actions');
  const canApprove = request.bookingStatus === 'pending' && onApprove;
  const canReject = request.bookingStatus === 'pending' && onReject;
  const canCancel = request.bookingStatus === 'confirmed' && onCancel;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onView} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          {t('view')}
        </DropdownMenuItem>
        {canApprove && (
          <DropdownMenuItem onClick={onApprove} className="cursor-pointer text-green-600">
            <CheckCircle className="mr-2 h-4 w-4" />
            {t('approve')}
          </DropdownMenuItem>
        )}
        {canReject && (
          <DropdownMenuItem onClick={onReject} className="cursor-pointer text-red-600">
            <XCircle className="mr-2 h-4 w-4" />
            {t('reject')}
          </DropdownMenuItem>
        )}
        {canCancel && (
          <DropdownMenuItem onClick={onCancel} className="cursor-pointer text-orange-600">
            <Ban className="mr-2 h-4 w-4" />
            {t('cancel')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

