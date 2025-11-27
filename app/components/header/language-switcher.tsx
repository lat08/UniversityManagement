'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from '@/app/components/ui/button';
import { Check } from 'lucide-react';
import { saveLocalePreference } from '@/lib/utils/localeStorage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

// Import flag icons từ country-flag-icons
import VN from 'country-flag-icons/react/3x2/VN';
import US from 'country-flag-icons/react/3x2/US';

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: 'vi' | 'en') => {
    if (newLocale === locale) return;
    // Lưu preference vào localStorage
    saveLocalePreference(newLocale);
    // Navigate với locale mới
    router.replace(pathname, { locale: newLocale });
  };

  const currentFlag = locale === 'vi' ? (
    <VN className="w-5 h-5" />
  ) : (
    <US className="w-5 h-5" />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
          aria-label="Change language"
        >
          {currentFlag}
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem
          onClick={() => switchLocale('vi')}
          className={locale === 'vi' ? 'bg-accent' : ''}
        >
          <span className="flex items-center gap-2 w-full">
            <VN className="w-5 h-5 flex-shrink-0" />
            <span>Tiếng Việt</span>
            {locale === 'vi' && <Check className="ml-auto h-4 w-4" />}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale('en')}
          className={locale === 'en' ? 'bg-accent' : ''}
        >
          <span className="flex items-center gap-2 w-full">
            <US className="w-5 h-5 flex-shrink-0" />
            <span>English</span>
            {locale === 'en' && <Check className="ml-auto h-4 w-4" />}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

