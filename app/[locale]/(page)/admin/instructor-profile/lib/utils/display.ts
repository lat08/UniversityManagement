type Translator = (key: string) => string;

const STATUS_COLOR_MAP: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  on_leave: 'bg-yellow-100 text-yellow-700',
  retired: 'bg-gray-100 text-gray-700',
  inactive: 'bg-red-100 text-red-700',
};

const STATUS_KEY_MAP: Record<string, string> = {
  active: 'active',
  on_leave: 'onLeave',
  retired: 'retired',
  inactive: 'inactive',
};

export const getEmploymentStatusDisplay = (status: string, t: Translator) => {
  const labelKey = STATUS_KEY_MAP[status];
  const label = labelKey ? t(labelKey) : status;
  const color = STATUS_COLOR_MAP[status] || 'bg-gray-100 text-gray-700';

  return { label, color };
};