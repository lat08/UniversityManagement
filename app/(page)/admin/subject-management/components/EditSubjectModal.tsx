'use client';

import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { Dropdown, Button, Input } from '@/app/components/ui';
import { commonApi } from '@/lib/api/common';
import { subjectsApi } from '../lib/api/subjectsApi';
import type { CreateSubjectPayload, Department } from '../lib/types/types';

interface EditSubjectModalProps {
  isOpen: boolean;
  subjectId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const validationSchema = yup.object({
  subjectName: yup.string().required('Tên môn học là bắt buộc').max(200, 'Tên môn học tối đa 200 ký tự'),
  subjectCode: yup.string().required('Mã môn học là bắt buộc').max(50, 'Mã môn học tối đa 50 ký tự'),
  credits: yup.number().required('Số tín chỉ là bắt buộc').min(1, 'Tối thiểu 1 tín chỉ').max(10, 'Tối đa 10 tín chỉ'),
  theoryHours: yup.number().required('Số giờ lý thuyết là bắt buộc').min(0, 'Số giờ lý thuyết phải >= 0'),
  practiceHours: yup.number().required('Số giờ thực hành là bắt buộc').min(0, 'Số giờ thực hành phải >= 0'),
  isGeneral: yup.boolean().required('Loại môn học là bắt buộc'),
  departmentId: yup.string().required('Khoa/Bộ môn là bắt buộc'),
  subjectStatus: yup.string().required('Trạng thái là bắt buộc'),
  prerequisiteSubjectId: yup.string().nullable(),
});

type FormData = InferType<typeof validationSchema>;

export default function EditSubjectModal({ isOpen, subjectId, onClose, onSuccess }: EditSubjectModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [prerequisiteSubjects, setPrerequisiteSubjects] = useState<{ subjectId: string; displayName: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const formValues = watch();

  useEffect(() => {
    if (!isOpen || !subjectId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [subjectRes, departmentsRes, subjectsRes] = await Promise.all([
          subjectsApi.getSubjectById(subjectId),
          commonApi.getDepartments({}),
          commonApi.getSubjects({}),
        ]);

        if (departmentsRes.success) setDepartments(departmentsRes.data);
        if (subjectsRes.success) {
          setPrerequisiteSubjects(
            subjectsRes.data
              .filter((s: { subjectId: string }) => s.subjectId !== subjectId)
              .map((s: { subjectId: string; subjectName: string; subjectCode: string }) => ({
                subjectId: s.subjectId,
                displayName: `${s.subjectName} - ${s.subjectCode}`,
              })),
          );
        }

        if (subjectRes.success) {
          const subject = subjectRes.data;
          reset({
            subjectName: subject.subjectName,
            subjectCode: subject.subjectCode,
            credits: subject.credits,
            theoryHours: subject.theoryHours,
            practiceHours: subject.practiceHours,
            isGeneral: subject.isGeneral,
            departmentId: subject.departmentId,
            subjectStatus: subject.subjectStatus,
            prerequisiteSubjectId: subject.prerequisiteSubjectId || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data', error);
        toast.error('Không thể tải thông tin môn học');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, subjectId, reset]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    reset();
    onClose();
  }, [isSubmitting, reset, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, handleClose]);

  const onSubmit = async (data: FormData) => {
    if (!subjectId) return;

    if (data.theoryHours === 0 && data.practiceHours === 0) {
      toast.error('Ít nhất một trong số giờ lý thuyết hoặc thực hành phải > 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateSubjectPayload = {
        subjectName: data.subjectName.trim(),
        subjectCode: data.subjectCode.trim().toUpperCase(),
        credits: data.credits,
        theoryHours: data.theoryHours,
        practiceHours: data.practiceHours,
        isGeneral: data.isGeneral,
        departmentId: data.departmentId,
        subjectStatus: data.subjectStatus as 'active' | 'inactive' | 'archived',
        prerequisiteSubjectId: data.prerequisiteSubjectId || undefined,
      };

      const res = await subjectsApi.updateSubject(subjectId, payload);
      if (res.success) {
        toast.success('Cập nhật môn học thành công!');
        onSuccess?.();
        handleClose();
      } else {
        toast.error(res.message || 'Cập nhật môn học thất bại');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi cập nhật môn học';
      toast.error(msg);
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

  const statusOptions = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Tạm ngưng' },
    { value: 'archived', label: 'Lưu trữ' },
  ];

  const isGeneralOptions = [
    { value: 'true', label: 'Môn đại cương' },
    { value: 'false', label: 'Môn chuyên ngành' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa môn học</h2>
              <p className="text-sm text-gray-600 mt-1">Chỉnh sửa thông tin các môn học được chọn</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0053AD] border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tên môn học <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="VD: Đại số tuyến tính"
                    {...register('subjectName')}
                    className={errors.subjectName ? 'border-red-500' : ''}
                  />
                  {errors.subjectName && (
                    <p className="mt-1 text-xs text-red-500">{errors.subjectName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Mã môn học <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="VD: DSTT"
                    {...register('subjectCode')}
                    className={errors.subjectCode ? 'border-red-500' : ''}
                  />
                  {errors.subjectCode && (
                    <p className="mt-1 text-xs text-red-500">{errors.subjectCode.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Số tín chỉ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    {...register('credits')}
                    className={errors.credits ? 'border-red-500' : ''}
                  />
                  {errors.credits && (
                    <p className="mt-1 text-xs text-red-500">{errors.credits.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Khoa/Bộ môn <span className="text-red-500">*</span>
                  </label>
                  <Dropdown
                    options={departments.map((d) => ({ value: d.departmentId, label: d.departmentName }))}
                    value={formValues.departmentId || ''}
                    placeholder="Chọn khoa/bộ môn"
                    onChange={(value) => setValue('departmentId', value, { shouldValidate: true })}
                    className={errors.departmentId ? 'border-red-500' : ''}
                  />
                  {errors.departmentId && (
                    <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Số giờ lý thuyết <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    {...register('theoryHours')}
                    className={errors.theoryHours ? 'border-red-500' : ''}
                  />
                  {errors.theoryHours && (
                    <p className="mt-1 text-xs text-red-500">{errors.theoryHours.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Số giờ thực hành <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    {...register('practiceHours')}
                    className={errors.practiceHours ? 'border-red-500' : ''}
                  />
                  {errors.practiceHours && (
                    <p className="mt-1 text-xs text-red-500">{errors.practiceHours.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Loại môn học <span className="text-red-500">*</span>
                  </label>
                  <Dropdown
                    options={isGeneralOptions}
                    value={String(formValues.isGeneral)}
                    placeholder="Chọn loại môn học"
                    onChange={(value) => setValue('isGeneral', value === 'true', { shouldValidate: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <Dropdown
                    options={statusOptions}
                    value={formValues.subjectStatus || 'active'}
                    placeholder="Chọn trạng thái"
                    onChange={(value) => setValue('subjectStatus', value)}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Môn tiên quyết</label>
                  <Dropdown
                    options={[
                      { value: '', label: 'Không có' },
                      ...prerequisiteSubjects.map((s) => ({ value: s.subjectId, label: s.displayName })),
                    ]}
                    value={formValues.prerequisiteSubjectId || ''}
                    placeholder="Chọn môn tiên quyết"
                    onChange={(value) => setValue('prerequisiteSubjectId', value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#0053AD] hover:bg-[#003d82] text-white"
              >
                {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
