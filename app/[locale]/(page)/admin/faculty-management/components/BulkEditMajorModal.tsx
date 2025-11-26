"use client";

import { useCallback, useEffect, useState } from "react";
import { Dropdown, Button } from "@/app/components/ui";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { majorsApi } from "../lib/api/majorsApi";
import type { Faculty, Curriculum } from "../lib/types/types";
import { useTranslations } from "next-intl";

interface BulkEditMajorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedMajorIds: string[];
}

export const BulkEditMajorModal = ({ isOpen, onClose, onSuccess, selectedMajorIds }: BulkEditMajorModalProps) => {
  const t = useTranslations("admin.facultyManagement");
  const tCommon = useTranslations("common.actions");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  
  const [facultyId, setFacultyId] = useState<string>('');
  const [curriculumId, setCurriculumId] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      majorsApi.getFaculties().then((res) => {
        if (res.success) setFaculties(res.data);
      });
      majorsApi.getCurricula().then((res) => {
        if (res.success) setCurricula(res.data);
      });
    }
  }, [isOpen]);

  const facultyOptions = [
    { value: '', label: t('filters.noChange') },
    ...faculties.map((f) => ({ value: f.facultyId, label: f.facultyName })),
  ];

  const curriculumOptions = [
    { value: '', label: t('filters.noChange') },
    ...curricula.map((c) => ({ value: c.curriculumId, label: c.curriculumName })),
  ];

  const statusOptions = [
    { value: '', label: t('filters.noChange') },
    { value: 'active', label: t('filters.active') },
    { value: 'inactive', label: t('filters.inactive') },
  ];

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setFacultyId('');
      setCurriculumId('');
      setStatus('');
      onClose();
    }
  }, [isSubmitting, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitting, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facultyId && !curriculumId && !status) {
      toast.error(t('hooks.bulkEditValidation'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: { majorIds: string[]; facultyId?: string; curriculumId?: string; status?: 'active' | 'inactive' } = {
        majorIds: selectedMajorIds,
      };

      if (facultyId) payload.facultyId = facultyId;
      if (curriculumId) payload.curriculumId = curriculumId;
      if (status) payload.status = status as 'active' | 'inactive';

      const response = await majorsApi.bulkUpdateMajors(payload);

      if (response.success) {
        toast.success(response.message || t('hooks.bulkEditSuccess'));
        setFacultyId('');
        setCurriculumId('');
        setStatus('');
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || t('hooks.bulkEditError'));
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                           (error as { message?: string })?.message || 
                           tCommon('error');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('modals.bulkEdit.title')}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('modals.bulkEdit.description', { count: selectedMajorIds.length })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('form.faculty.label')}
              </label>
              <Dropdown
                options={facultyOptions}
                value={facultyId}
                placeholder={t('form.faculty.placeholder')}
                onChange={setFacultyId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('form.curriculum.label')}
              </label>
              <Dropdown
                options={curriculumOptions}
                value={curriculumId}
                placeholder={t('form.curriculum.placeholder')}
                onChange={setCurriculumId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('form.status.label')}
              </label>
              <Dropdown
                options={statusOptions}
                value={status}
                placeholder={t('form.status.placeholder')}
                onChange={setStatus}
              />
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-[#0053AD] bg-white text-[#0053AD] hover:bg-[#0053AD]/10 hover:border-[#0053AD]/80 transition-colors"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white border-[#0053AD] hover:border-[#003d82] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('modals.bulkEdit.submitting') : t('modals.bulkEdit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
