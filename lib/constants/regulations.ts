import {
  RegulationAudience,
  RegulationCategory,
  RegulationIssuingUnit,
  RegulationStatus,
} from '@/lib/types/regulation';

interface LocalizedOption {
  readonly value: string;
  readonly labelKey: string;
}

export const REGULATION_STATUS_META: Record<
  RegulationStatus,
  {
    readonly labelKey: string;
    readonly descriptionKey: string;
    readonly badgeClass: string;
  }
> = {
  draft: {
    labelKey: 'status.draft',
    descriptionKey: 'statusDescriptions.draft',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  active: {
    labelKey: 'status.active',
    descriptionKey: 'statusDescriptions.active',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  archived: {
    labelKey: 'status.archived',
    descriptionKey: 'statusDescriptions.archived',
    badgeClass: 'bg-gray-100 text-gray-600 ring-gray-200',
  },
};

export const REGULATION_CATEGORIES: readonly LocalizedOption[] = [
  { value: 'admission', labelKey: 'categories.admission' },
  { value: 'academic', labelKey: 'categories.academic' },
  { value: 'finance', labelKey: 'categories.finance' },
  { value: 'student_affairs', labelKey: 'categories.studentAffairs' },
  { value: 'general', labelKey: 'categories.general' },
] as const;

export const REGULATION_CATEGORY_LABEL_KEY: Record<RegulationCategory, string> = REGULATION_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.value as RegulationCategory] = category.labelKey;
    return acc;
  },
  {} as Record<RegulationCategory, string>,
);

export const REGULATION_ISSUING_UNITS: readonly LocalizedOption[] = [
  { value: 'training_dept', labelKey: 'units.trainingDept' },
  { value: 'admission_office', labelKey: 'units.admissionOffice' },
  { value: 'student_affairs', labelKey: 'units.studentAffairs' },
  { value: 'finance_office', labelKey: 'units.financeOffice' },
  { value: 'management_board', labelKey: 'units.managementBoard' },
] as const;

export const REGULATION_ISSUING_UNIT_LABEL_KEY: Record<RegulationIssuingUnit, string> = REGULATION_ISSUING_UNITS.reduce(
  (acc, unit) => {
    acc[unit.value as RegulationIssuingUnit] = unit.labelKey;
    return acc;
  },
  {} as Record<RegulationIssuingUnit, string>,
);

export const REGULATION_STATUS_OPTIONS: Array<{ value: RegulationStatus | 'all'; labelKey: string }> = [
  { value: 'all', labelKey: 'filters.status.all' },
  ...Object.entries(REGULATION_STATUS_META).map(([value, meta]) => ({
    value: value as RegulationStatus,
    labelKey: meta.labelKey,
  })),
];

export const REGULATION_AUDIENCE_OPTIONS: Array<{ value: RegulationAudience | 'all'; labelKey: string }> = [
  { value: 'all', labelKey: 'audience.all' },
  { value: 'student', labelKey: 'audience.student' },
  { value: 'instructor', labelKey: 'audience.instructor' },
];

export const REGULATION_AUDIENCE_LABEL_KEY: Record<RegulationAudience, string> = {
  student: 'audience.student',
  instructor: 'audience.instructor',
  all: 'audience.all',
};