import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const fullTitle = `${title} - SIU`;
    document.title = fullTitle;
    
    // Cleanup: restore default title when component unmounts
    return () => {
      document.title = 'SIU - Đại học Quốc tế Sài Gòn';
    };
  }, [title]);
}

