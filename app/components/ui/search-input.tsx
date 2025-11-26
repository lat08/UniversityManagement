import { Search } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils/utils';
import { GLOBAL_SEARCH_MAX_LENGTH } from '@/lib/constants/search-limits';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  readonly placeholder?: string;
  readonly maxLength?: number;
  readonly showCounter?: boolean;
}

export function SearchInput({
  className,
  placeholder = 'Tìm kiếm...',
  maxLength = GLOBAL_SEARCH_MAX_LENGTH,
  showCounter = true,
  value,
  ...props
}: SearchInputProps) {
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        className={cn('pl-10 pr-16', className)}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      {showCounter && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
          {currentLength}/{maxLength}
        </span>
      )}
    </div>
  );
}

