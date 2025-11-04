import { Search } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils/utils';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  readonly placeholder?: string;
}

export function SearchInput({ className, placeholder = 'Tìm kiếm...', ...props }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        className={cn('pl-10', className)}
        {...props}
      />
    </div>
  );
}

