'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dropdown } from '@/app/components/ui';
import { RegulationMutationPayload, RegulationRecord, RegulationStatus } from '@/lib/types/regulation';
import {
  REGULATION_AUDIENCE_OPTIONS,
  REGULATION_CATEGORIES,
  REGULATION_ISSUING_UNITS,
  REGULATION_STATUS_META,
} from '@/lib/constants/regulations';
import { Calendar, Upload, X } from 'lucide-react';
import { format, parse } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

type TranslateFn = ReturnType<typeof useTranslations>;

const createSchema = (t: TranslateFn) =>
  z
    .object({
      code: z
        .string()
        .min(2, t('codeMin'))
        .regex(/^[A-Za-z0-9_-]+$/, t('codePattern')),
      title: z
        .string()
        .min(4, t('titleMin'))
        .max(200, t('titleMax'))
        .regex(/^[\p{L}0-9 _-]+$/u, t('titlePattern')),
      description: z
        .string()
        .min(10, t('descriptionMin'))
        .max(500, t('descriptionMax')),
      category: z.string().min(1, t('categoryRequired')),
      issuingUnit: z.string().min(1, t('issuingUnitRequired')),
      status: z.enum(['draft', 'active', 'archived']),
      issueDate: z.string().min(1, t('issueDateRequired')),
      effectiveDate: z.string().min(1, t('effectiveDateRequired')),
      expiredDate: z.string().optional(),
      targetAudience: z.enum(['student', 'instructor', 'all']),
    })
    .refine(
      (values) => {
        if (!values.issueDate || !values.effectiveDate) return true;
        return new Date(values.effectiveDate) >= new Date(values.issueDate);
      },
      {
        path: ['effectiveDate'],
        message: t('effectiveAfterIssue'),
      },
    );

type RegulationFormValues = z.infer<ReturnType<typeof createSchema>>;

const DEFAULT_DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';
const ISO_DATE_FORMAT = 'yyyy-MM-dd';

interface RegulationFormModalProps {
  readonly isOpen: boolean;
  readonly mode: 'create' | 'edit';
  readonly initialData?: RegulationRecord | null;
  readonly onClose: () => void;
  readonly onSubmit: (payload: RegulationMutationPayload, file: File | null) => Promise<void>;
}

const defaultFormValues: RegulationFormValues = {
  code: '',
  title: '',
  description: '',
  category: '',
  issuingUnit: '',
  status: 'draft',
  issueDate: '',
  effectiveDate: '',
  expiredDate: '',
  targetAudience: 'all',
};

export const RegulationFormModal = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: RegulationFormModalProps) => {
  const t = useTranslations('admin.regulations');
  const tValidation = useTranslations('admin.regulations.form.validation');
  const locale = useLocale();
  const schema = useMemo(() => createSchema(tValidation), [tValidation]);
  const dateLocale = locale === 'vi' ? vi : enUS;
  const displayDateFormat = locale === 'vi' ? DEFAULT_DISPLAY_DATE_FORMAT : 'MM/dd/yyyy';
  const datePlaceholder = locale === 'vi' ? 'dd/mm/yyyy' : 'mm/dd/yyyy';
  const statusOptions = useMemo(
    () =>
      (Object.keys(REGULATION_STATUS_META) as RegulationStatus[]).map((status) => ({
        value: status,
        label: t(REGULATION_STATUS_META[status].labelKey),
      })),
    [t],
  );
  const categoryOptions = useMemo(
    () => REGULATION_CATEGORIES.map((item) => ({ value: item.value, label: t(item.labelKey) })),
    [t],
  );
  const issuingUnitOptions = useMemo(
    () => REGULATION_ISSUING_UNITS.map((item) => ({ value: item.value, label: t(item.labelKey) })),
    [t],
  );
  const audienceOptions = useMemo(
    () => REGULATION_AUDIENCE_OPTIONS.map((item) => ({ value: item.value, label: t(item.labelKey) })),
    [t],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState<{ [key: string]: boolean }>({});
  const [dateInputValues, setDateInputValues] = useState<{ [key: string]: string }>({});
  const [calendarPositions, setCalendarPositions] = useState<{ [key: string]: { top: number; left: number } }>({});
  const issueDateRef = useRef<HTMLInputElement>(null);
  const effectiveDateRef = useRef<HTMLInputElement>(null);
  const expiredDateRef = useRef<HTMLInputElement>(null);
  const inputRefs = useMemo(
    () => ({
      issueDate: issueDateRef,
      effectiveDate: effectiveDateRef,
      expiredDate: expiredDateRef,
    }),
    [effectiveDateRef, expiredDateRef, issueDateRef],
  );

  const initialValues = useMemo<RegulationFormValues>(() => {
    if (!initialData) return defaultFormValues;
    return {
      code: initialData.code,
      title: initialData.title,
      description: initialData.description,
      category: initialData.category,
      issuingUnit: initialData.issuingUnit,
      status: initialData.status,
      issueDate: initialData.issueDate.slice(0, 10),
      effectiveDate: initialData.effectiveDate.slice(0, 10),
      expiredDate: initialData.expireDate?.slice(0, 10) ?? '',
      targetAudience: initialData.targetAudience,
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<RegulationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
      setSelectedFile(null);
      setFileError(null);
      setShowCalendar({});
      setDateInputValues({
        issueDate: initialValues.issueDate
          ? format(new Date(initialValues.issueDate), displayDateFormat, { locale: dateLocale })
          : '',
        effectiveDate: initialValues.effectiveDate
          ? format(new Date(initialValues.effectiveDate), displayDateFormat, { locale: dateLocale })
          : '',
        expiredDate: initialValues.expiredDate
          ? format(new Date(initialValues.expiredDate), displayDateFormat, { locale: dateLocale })
          : '',
      });
    }
  }, [dateLocale, displayDateFormat, initialValues, isOpen, reset]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isCalendarClick = target.closest('.rdp') || target.closest('[data-calendar-popup]');
      if (!isCalendarClick) {
        Object.keys(showCalendar).forEach((field) => {
          const inputRef = inputRefs[field as keyof typeof inputRefs];
          if (inputRef.current && !inputRef.current.contains(target)) {
            setShowCalendar((prev) => ({ ...prev, [field]: false }));
          }
        });
      }
    };

    if (Object.values(showCalendar).some((v) => v)) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inputRefs, showCalendar]);

  useEffect(() => {
    const updateCalendarPositions = () => {
      const newPositions: { [key: string]: { top: number; left: number } } = {};
      Object.entries(inputRefs).forEach(([field, ref]) => {
        if (ref.current && showCalendar[field]) {
          const rect = ref.current.getBoundingClientRect();
          const scrollY = window.scrollY || window.pageYOffset;
          const scrollX = window.scrollX || window.pageXOffset;
          const calendarWidth = 300;
          const calendarHeight = 300;
          
          // Prefer rendering the calendar on the right side of the input
          let left = rect.right + scrollX - calendarWidth;
          // Fallback to the left side if there is no room
          if (left < scrollX) {
            left = rect.left + scrollX;
          }
          
          let top = rect.bottom + scrollY + 8;
          // Fallback above the field when there is no space below
          if (top + calendarHeight > window.innerHeight + scrollY) {
            top = rect.top + scrollY - calendarHeight - 8;
          }
          
          newPositions[field] = { top, left };
        }
      });
      if (Object.keys(newPositions).length > 0) {
        setCalendarPositions(newPositions);
      }
    };

    if (Object.values(showCalendar).some((v) => v)) {
      // Delay to ensure the DOM is rendered before measuring
      const timeoutId = setTimeout(updateCalendarPositions, 0);
      window.addEventListener('scroll', updateCalendarPositions, true);
      window.addEventListener('resize', updateCalendarPositions);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', updateCalendarPositions, true);
        window.removeEventListener('resize', updateCalendarPositions);
      };
    }
  }, [inputRefs, showCalendar]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const handleDateInputChange = (field: string, value: string) => {
    setDateInputValues((prev) => ({ ...prev, [field]: value }));

    if (value.length === 10) {
      try {
        const parsedDate = parse(value, displayDateFormat, new Date());
        if (!isNaN(parsedDate.getTime())) {
          setValue(field as keyof RegulationFormValues, format(parsedDate, ISO_DATE_FORMAT));
        }
      } catch {
        // Invalid date format
      }
    }
  };

  const handleCalendarSelect = (field: string, date: Date | undefined) => {
    if (date) {
      const dateStr = format(date, ISO_DATE_FORMAT);
      const displayStr = format(date, displayDateFormat, { locale: dateLocale });
      setValue(field as keyof RegulationFormValues, dateStr);
      setDateInputValues((prev) => ({ ...prev, [field]: displayStr }));
      setShowCalendar((prev) => ({ ...prev, [field]: false }));
    }
  };

  const getFileNameFromUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      // Remove timestamp prefix if exists (format: timestamp-filename)
      const parts = fileName.split('-');
      if (parts.length > 1 && /^\d+$/.test(parts[0])) {
        return parts.slice(1).join('-');
      }
      return fileName;
    } catch {
      return url;
    }
  };

  const onFormSubmit = async (values: RegulationFormValues) => {
    setIsSubmitting(true);
    const payload: RegulationMutationPayload = {
      code: values.code,
      title: values.title,
      description: values.description,
      issuingUnit: values.issuingUnit as RegulationMutationPayload['issuingUnit'],
      category: values.category as RegulationMutationPayload['category'],
      status: values.status,
      issueDate: values.issueDate,
      effectiveDate: values.effectiveDate,
      expireDate: values.expiredDate || null,
      targetAudience: values.targetAudience,
      version: 'v1.0', // Default value, hidden from UI
      fileUrl: initialData?.fileUrl ?? null,
      fileType: selectedFile ? selectedFile.name.split('.').pop()?.toLowerCase() ?? null : initialData?.fileType ?? null,
    };

    try {
      await onSubmit(payload, selectedFile);
      onClose();
    } catch {
      // Feedback is handled at page level
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleBackdropClick}>
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? t('form.title.create') : t('form.title.edit')}
              </h2>
              <p className="text-sm text-gray-500">{t('form.subtitle')}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
              aria-label={t('form.actions.close')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                {t('form.fields.code')} <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder={t('form.placeholders.code')}
                {...register('code')}
                className={errors.code ? 'border-red-500' : ''}
                onKeyDown={(event) => {
                  const isControlKey =
                    event.key === 'Backspace' ||
                    event.key === 'Delete' ||
                    event.key === 'Tab' ||
                    event.key === 'ArrowLeft' ||
                    event.key === 'ArrowRight' ||
                    event.key === 'Home' ||
                    event.key === 'End';
                  if (isControlKey) {
                    return;
                  }
                  if (!/^[A-Za-z0-9_-]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                {t('form.fields.title')} <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder={t('form.placeholders.title')}
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
                maxLength={200}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                {t('form.fields.description')} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                className={`w-full rounded-lg border px-4 py-2 text-sm ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('form.placeholders.description')}
                maxLength={500}
                {...register('description')}
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  {t('form.fields.category')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={categoryOptions}
                  value={watch('category')}
                  placeholder={t('form.placeholders.category')}
                  onChange={(value) => setValue('category', value ?? '')}
                  buttonClassName={errors.category ? 'border-red-500' : ''}
                />
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  {t('form.fields.issuingUnit')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={issuingUnitOptions}
                  value={watch('issuingUnit')}
                  placeholder={t('form.placeholders.issuingUnit')}
                  onChange={(value) => setValue('issuingUnit', value ?? '')}
                  buttonClassName={errors.issuingUnit ? 'border-red-500' : ''}
                />
                {errors.issuingUnit && <p className="mt-1 text-xs text-red-500">{errors.issuingUnit.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: t('form.fields.issueDate'), field: 'issueDate', required: true, error: errors.issueDate },
                { label: t('form.fields.effectiveDate'), field: 'effectiveDate', required: true, error: errors.effectiveDate },
                { label: t('form.fields.expireDate'), field: 'expiredDate', required: false, error: errors.expiredDate },
              ].map(({ label, field, required, error }) => {
                const dateValue = watch(field as keyof RegulationFormValues);
                const selectedDate = dateValue
                  ? dateValue.includes('/')
                    ? parse(dateValue, displayDateFormat, new Date())
                    : new Date(dateValue)
                  : undefined;
                
                return (
                  <div key={field} className="relative space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                      {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        ref={inputRefs[field as keyof typeof inputRefs]}
                        type="text"
                        value={dateInputValues[field] || ''}
                        onChange={(e) => handleDateInputChange(field, e.target.value)}
                        onFocus={() => setShowCalendar((prev) => ({ ...prev, [field]: true }))}
                        placeholder={datePlaceholder}
                        maxLength={10}
                        className={`w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0053AD] bg-white ${
                          error ? 'border-red-500' : 'border-gray-200'
                        }`}
                        onKeyDown={(e) => {
                          if (
                            !/[0-9/]/.test(e.key) &&
                            e.key !== 'Backspace' &&
                            e.key !== 'Delete' &&
                            e.key !== 'ArrowLeft' &&
                            e.key !== 'ArrowRight' &&
                            e.key !== 'Tab'
                          ) {
                            e.preventDefault();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCalendar((prev) => ({ ...prev, [field]: !prev[field] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <Calendar className="h-5 w-5" />
                      </button>
                    </div>
                    {showCalendar[field] &&
                      typeof window !== 'undefined' &&
                      createPortal(
                        <div
                          data-calendar-popup
                          className="fixed z-[60] bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                          style={{
                            top: `${calendarPositions[field]?.top || 0}px`,
                            left: `${calendarPositions[field]?.left || 0}px`,
                          }}
                        >
                          <DayPicker
                            mode="single"
                            selected={selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : undefined}
                            onSelect={(date) => handleCalendarSelect(field, date)}
                            locale={dateLocale}
                            classNames={{
                              day_selected: 'bg-[#0053AD] text-white',
                              day_today: 'bg-[#0053AD]/20 text-[#0053AD] font-semibold',
                              day_disabled: 'text-gray-300',
                              day: 'hover:bg-gray-100 rounded',
                            }}
                          />
                        </div>,
                        document.body,
                      )}
                    {error && <p className="text-xs text-red-500">{error.message}</p>}
                  </div>
                );
              })}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  {t('form.fields.status')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={statusOptions}
                  value={watch('status')}
                  placeholder={t('form.placeholders.status')}
                  onChange={(value) => setValue('status', (value ? (value as RegulationStatus) : 'draft'))}
                  buttonClassName={errors.status ? 'border-red-500' : ''}
                />
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  {t('form.fields.audience')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  options={audienceOptions}
                  value={watch('targetAudience')}
                  placeholder={t('form.placeholders.audience')}
                  onChange={(value) =>
                    setValue('targetAudience', (value ? (value as RegulationMutationPayload['targetAudience']) : 'all'))
                  }
                  buttonClassName={errors.targetAudience ? 'border-red-500' : ''}
                />
                {errors.targetAudience && <p className="mt-1 text-xs text-red-500">{errors.targetAudience.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">{t('form.fields.attachment')}</label>
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                <label className="flex cursor-pointer flex-col items-center gap-2 text-gray-500">
                  <Upload className="h-5 w-5" />
                  <span>{t('form.file.helper')}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (!file) {
                        setSelectedFile(null);
                        setFileError(null);
                        return;
                      }
                      const validTypes = [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      ];
                      if (!validTypes.includes(file.type)) {
                        setFileError(t('form.file.typeError'));
                        setSelectedFile(null);
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        setFileError(t('form.file.sizeError'));
                        setSelectedFile(null);
                        return;
                      }
                      setSelectedFile(file);
                      setFileError(null);
                    }}
                  />
                </label>
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-700">{t('form.file.selected', { name: selectedFile.name })}</p>
                )}
                {fileError && <p className="mt-1 text-xs text-red-500">{fileError}</p>}
                {!selectedFile && !fileError && initialData?.fileUrl && (
                  <p className="mt-2 text-xs text-gray-500">
                    {t('form.file.current', {
                      name: initialData.fileName || getFileNameFromUrl(initialData.fileUrl),
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border-[#0053AD] text-[#0053AD] hover:bg-[#0053AD]/10"
            >
              {t('form.actions.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#0053AD] text-white hover:bg-[#003d82]">
              {isSubmitting
                ? t('form.actions.saving')
                : mode === 'create'
                  ? t('form.actions.saveDraft')
                  : t('form.actions.update')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


