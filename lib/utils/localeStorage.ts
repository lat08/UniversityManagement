/**
 * Utility functions để lưu và lấy locale preference từ localStorage
 */

const LOCALE_STORAGE_KEY = 'preferred-locale';

/**
 * Lưu locale preference vào localStorage
 */
export const saveLocalePreference = (locale: 'vi' | 'en'): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (error) {
      console.error('Failed to save locale preference:', error);
    }
  }
};

/**
 * Lấy locale preference từ localStorage
 * @returns Locale preference hoặc null nếu chưa có
 */
export const getLocalePreference = (): 'vi' | 'en' | null => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved === 'vi' || saved === 'en') {
        return saved;
      }
    } catch (error) {
      console.error('Failed to get locale preference:', error);
    }
  }
  return null;
};

/**
 * Lấy locale preference hoặc trả về default locale
 */
export const getLocalePreferenceOrDefault = (defaultLocale: 'vi' | 'en' = 'vi'): 'vi' | 'en' => {
  return getLocalePreference() || defaultLocale;
};

