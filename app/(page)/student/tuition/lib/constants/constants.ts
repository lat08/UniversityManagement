export const POLLING_CONFIG = {
  INTERVAL: 2000,
  TIMEOUT: 5 * 60 * 1000,
} as const;

export const CACHE_TIME = {
  SEMESTERS: 10 * 60 * 1000,
  TUITION: 3 * 60 * 1000,
  INSURANCE: 5 * 60 * 1000,
  PAYMENTS: 60 * 1000,
} as const;

export const GC_TIME = {
  SEMESTERS: 30 * 60 * 1000,
  TUITION: 10 * 60 * 1000,
  INSURANCE: 15 * 60 * 1000,
  PAYMENTS: 5 * 60 * 1000,
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const COURSE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

