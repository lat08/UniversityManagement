import {
  RegulationAudience,
  RegulationCategory,
  RegulationIssuingUnit,
  RegulationStatus,
} from '@/lib/types/regulation';

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export const REGULATION_STATUS_META: Record<
RegulationStatus,
{
  readonly label: string;
  readonly description: string;
  readonly badgeClass: string;
}
> = {
  draft: {
    label: 'Bản nháp',
    description: 'Đang soạn thảo hoặc chờ phê duyệt',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  active: {
    label: 'Đang áp dụng',
    description: 'Đã ban hành và có hiệu lực',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  archived: {
    label: 'Đã lưu trữ',
    description: 'Hết hiệu lực hoặc thay thế',
    badgeClass: 'bg-gray-100 text-gray-600 ring-gray-200',
  },
};

export const REGULATION_CATEGORIES: readonly SelectOption[] = [
  { value: 'admission', label: 'Tuyển sinh' },
  { value: 'academic', label: 'Đào tạo' },
  { value: 'finance', label: 'Tài chính' },
  { value: 'student_affairs', label: 'Công tác sinh viên' },
  { value: 'general', label: 'Quy định chung' },
] as const;

export const REGULATION_CATEGORY_LABEL: Record<RegulationCategory, string> = REGULATION_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.value as RegulationCategory] = category.label;
    return acc;
  },
  {} as Record<RegulationCategory, string>,
);

export const REGULATION_ISSUING_UNITS: readonly SelectOption[] = [
  { value: 'training_dept', label: 'Phòng Đào tạo' },
  { value: 'admission_office', label: 'Ban Tuyển sinh' },
  { value: 'student_affairs', label: 'Phòng CTSV' },
  { value: 'finance_office', label: 'Phòng Tài chính' },
  { value: 'management_board', label: 'Ban Giám hiệu' },
] as const;

export const REGULATION_ISSUING_UNIT_LABEL: Record<RegulationIssuingUnit, string> = REGULATION_ISSUING_UNITS.reduce(
  (acc, unit) => {
    acc[unit.value as RegulationIssuingUnit] = unit.label;
    return acc;
  },
  {} as Record<RegulationIssuingUnit, string>,
);

export const REGULATION_STATUS_OPTIONS: Array<{ value: RegulationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  ...Object.entries(REGULATION_STATUS_META).map(([value, meta]) => ({
    value: value as RegulationStatus,
    label: meta.label,
  })),
];

export const REGULATION_AUDIENCE_OPTIONS: Array<{ value: RegulationAudience | 'all'; label: string }> = [
  { value: 'all', label: 'Tất cả đối tượng' },
  { value: 'student', label: 'Sinh viên' },
  { value: 'instructor', label: 'Giảng viên' },
];

export const REGULATION_AUDIENCE_LABEL: Record<RegulationAudience, string> = {
  student: 'Sinh viên',
  instructor: 'Giảng viên',
  all: 'Tất cả',
};