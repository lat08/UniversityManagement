'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { TuitionDebtItem } from '@/lib/types';

interface CreateReminderModalProps {
  readonly open: boolean;
  readonly student: TuitionDebtItem | null;
  readonly students: TuitionDebtItem[];
  readonly onClose: () => void;
  readonly onSend: (data: {
    studentCodes: string[];
    title: string;
    content: string;
  }) => Promise<void>;
}

export const CreateReminderModal = ({
  open,
  student,
  students,
  onClose,
  onSend,
}: CreateReminderModalProps) => {
  const t = useTranslations('admin.tuition');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBulk = students.length > 0;
  const selectedCount = isBulk ? students.length : (student ? 1 : 0);

  useEffect(() => {
    if (student || isBulk) {
      setTitle('');
      setContent('');
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

    if (!title.trim()) {
      toast.error(t('reminder.titleRequired'));
      return;
    }

    if (!content.trim()) {
      toast.error(t('reminder.contentRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const studentCodes = isBulk
        ? students.map((s) => s.studentCode)
        : [student!.studentCode];
      await onSend({
        studentCodes,
        title: title.trim(),
        content: content.trim(),
      });
      toast.success(t('reminder.success'));
      onClose();
    } catch (error) {
      const message =
        (error as { message?: string })?.message || t('reminder.error');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || (!student && !isBulk)) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex-1">
            <p className="text-xs uppercase text-gray-400">
              {t('reminder.subtitle')}
            </p>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('reminder.title')}
            </h2>
            {isBulk && (
              <p className="mt-1 text-sm text-gray-600">
                {t('reminder.bulkDescription', { count: selectedCount })}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            type="button"
            aria-label={t('reminder.close')}
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
                      {t('reminder.fields.code')}
                    </label>
                    <Input value={student!.studentCode} disabled />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t('reminder.fields.fullName')}
                    </label>
                    <Input value={student!.fullName} disabled />
                  </div>
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('reminder.fields.title')}
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('reminder.fields.titlePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('reminder.fields.content')}
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('reminder.fields.contentPlaceholder')}
                  rows={6}
                  required
                />
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
              {t('reminder.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('reminder.sending') : t('reminder.send')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

