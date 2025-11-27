export type ScheduleTranslationValues = Record<string, string | number | Date>

export type ScheduleTranslationFn = (key: string, values?: ScheduleTranslationValues) => string


