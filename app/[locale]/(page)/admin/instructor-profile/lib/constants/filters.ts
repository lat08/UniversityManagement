type Translator = (key: string) => string;

const EMPLOYMENT_STATUS_OPTION_DEFINITIONS = [
  { value: '', labelKey: 'allStatuses' },
  { value: 'active', labelKey: 'active' },
  { value: 'on_leave', labelKey: 'onLeave' },
  { value: 'retired', labelKey: 'retired' },
  { value: 'inactive', labelKey: 'inactive' },
] as const;

const DEGREE_OPTION_DEFINITIONS = [
  { value: '', labelKey: 'allDegrees' },
  { value: 'PhD', labelKey: 'phd' },
  { value: 'Master', labelKey: 'master' },
  { value: 'Bachelor', labelKey: 'bachelor' },
  { value: 'Engineer', labelKey: 'engineer' },
] as const;

export const getEmploymentStatusOptions = (t: Translator) =>
  EMPLOYMENT_STATUS_OPTION_DEFINITIONS.map(({ value, labelKey }) => ({
    value,
    label: t(labelKey),
  }));

export const getDegreeOptions = (t: Translator) =>
  DEGREE_OPTION_DEFINITIONS.map(({ value, labelKey }) => ({
    value,
    label: t(labelKey),
  }));