'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { TuitionDebtItem } from '@/lib/types';

interface EditTuitionModalProps {
  readonly open: boolean;
  readonly student: TuitionDebtItem | null;
  readonly students: TuitionDebtItem[];
  readonly onClose: () => void;
  readonly onSave: (data: {
    studentCodes: string[];
    status: string;
    notes: string;
  }) => Promise<void>;
}

export const EditTuitionModal = ({
  open,
  student,
  students,
  onClose,
  onSave,
}: EditTuitionModalProps) => {
  const t = useTranslations('admin.tuition');
  const [status, setStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBulk = students.length > 0;
  const selectedCount = isBulk ? students.length : (student ? 1 : 0);

  useEffect(() => {
    if (student && !isBulk) {
      setStatus(student.status || '');
      setNotes('');
    } else if (isBulk) {
      setStatus('');
      setNotes('');
    }
  }, [student, isBulk]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!student && !isBulk) return;

    if (!status.trim()) {
      toast.error(t('edit.statusRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const studentCodes = isBulk
        ? students.map((s) => s.studentCode)
        : [student!.studentCode];
      await onSave({
        studentCodes,
        status: status.trim(),
        notes: notes.trim(),
      });
      toast.success(t('edit.success'));
      onClose();
    } catch (error) {
      const message =
        (error as { message?: string })?.message || t('edit.error');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || (!student && !isBulk)) {
    return null;
  }

  const statusOptions = [
    { value: 'Đã thanh toán', label: t('status.paid') },
    { value: 'Chưa thanh toán', label: t('status.unpaid') },
    { value: 'Quá hạn', label: t('status.overdue') },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex-1">
            <p className="text-xs uppercase text-gray-400">
              {t('edit.subtitle')}
            </p>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('edit.title')}
            </h2>
            {isBulk && (
              <p className="mt-1 text-sm text-gray-600">
                {t('edit.bulkDescription', { count: selectedCount })}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            type="button"
            aria-label={t('edit.close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 overflow-y-auto px-6 py-6">
            <div className="space-y-4">
              {!isBulk && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t('edit.fields.code')}
                    </label>
                    <Input value={student!.studentCode} disabled />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t('edit.fields.fullName')}
                    </label>
                    <Input value={student!.fullName} disabled />
                  </div>
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('edit.fields.status')}
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('edit.fields.statusPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('edit.fields.notes')}
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('edit.fields.notesPlaceholder')}
                  maxLength={500}
                  rows={4}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {notes.length}/500 {t('edit.fields.maxCharacters')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              disabled={isSubmitting}
            >
              {t('edit.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('edit.saving') : t('edit.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

