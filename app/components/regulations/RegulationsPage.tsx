'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { useRegulations } from './lib/hooks/useRegulations';
import { RegulationCard } from './RegulationCard';
import { RegulationsSkeleton } from './RegulationsSkeleton';
import { RegulationsRefetchIndicator } from './RegulationsRefetchIndicator';
import { Dropdown } from '@/app/components/ui';
import { REGULATION_CATEGORIES } from '@/lib/constants/regulations';
import { Regulation } from './lib/api/regulationsApi';

interface ExtendedRegulation extends Regulation {
  category?: string;
}

interface RegulationsPageProps {
  readonly pageTitle: string;
  readonly description: string;
  readonly noticeText?: string;
}

export const RegulationsPage = ({ pageTitle, description, noticeText }: RegulationsPageProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [, startTransition] = useTransition();
  
  const { data, isPending: isLoading, error, refetch, isRefetching } = useRegulations({
    pageSize: 50,
    orderBy: 1,
    isActive: true,
  });

  const isInitialLoading = !data && isLoading;
  const regulations = useMemo(() => data ?? [], [data]);

  const toggleExpand = useCallback(
    (id: string) => {
      setExpandedId((current) => (current === id ? null : id));
    },
    [],
  );

  const handleSearchChange = useCallback((value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  }, []);

  const filteredRegulations = useMemo(() => {
    let filtered = regulations;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((regulation) => {
        const extendedReg = regulation as ExtendedRegulation;
        return extendedReg.category === categoryFilter;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((regulation) => {
        const { title = '', description: desc = '' } = regulation;
        const targetAudience =
          (regulation as { targetAudience?: string }).targetAudience ??
          (regulation as { target?: string }).target ??
          '';
        return (
          title.toLowerCase().includes(query) ||
          desc.toLowerCase().includes(query) ||
          targetAudience.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [regulations, searchQuery, categoryFilter]);

  if (isInitialLoading) {
    return <RegulationsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <header className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">{pageTitle}</h1>
          <p className="text-sm text-gray-600">{description}</p>
        </header>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 lg:p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Không thể tải dữ liệu</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={refetch}
                disabled={isRefetching}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isRefetching ? 'Đang tải...' : 'Thử lại'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (regulations.length === 0) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <header className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">{pageTitle}</h1>
          <p className="text-sm text-gray-600">{description}</p>
        </header>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center lg:p-6">
          <p className="text-gray-600">Chưa có quy chế nào được công bố.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {isRefetching && <RegulationsRefetchIndicator />}
      
      <header className="space-y-2">
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">{pageTitle}</h1>
        <p className="text-sm text-gray-600">{description}</p>
      </header>

      <div className="flex flex-nowrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc đối tượng..."
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-shrink-0 w-48">
          <Dropdown
            options={[
              { value: 'all', label: 'Tất cả loại' },
              ...REGULATION_CATEGORIES.map((item) => ({ value: item.value, label: item.label })),
            ]}
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value ?? 'all')}
            placeholder="Loại quy định"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredRegulations.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-gray-600">
              Không tìm thấy quy chế phù hợp với từ khóa &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          filteredRegulations.map((regulation, index) => (
            <RegulationCard
              key={regulation.id}
              regulation={regulation}
              isExpanded={expandedId === regulation.id}
              onToggle={() => toggleExpand(regulation.id)}
              noticeText={noticeText}
              animationDelay={Math.min(index * 50, 300)}
            />
          ))
        )}
      </div>
    </div>
  );
};

