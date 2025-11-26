'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DollarSign, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Checkbox,
  Dropdown,
  Pagination,
  SearchInput,
  Table,
  type TableColumn,
} from '@/app/components/ui';
import { TuitionStatCard } from './components/TuitionStatCard';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { useTuitionDebts } from '@/lib/hooks/useTuitionDebt';
import { useSemesters, useClasses, useDepartments } from '@/lib/hooks/useCommonData';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { TuitionDebtDetailModal } from './components/tuition-debt-detail-modal';
import { TuitionDebtActionsMenu } from './components/tuition-debt-actions-menu';
import type { TuitionDebtItem, TuitionDebtFilter, TuitionDebtResponse } from '@/lib/types';

const PAGE_SIZE = 20;

export default function AdminTuitionPage() {
  const t = useTranslations('admin.tuition');
  const pageTitle = t('pageTitle');
  usePageTitle(pageTitle);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [semesterId, setSemesterId] = useState<string>('');
  const [classId, setClassId] = useState<string>('all');
  const [departmentId, setDepartmentId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudentCodes, setSelectedStudentCodes] = useState<Set<string>>(new Set());
  const [detailStudentCode, setDetailStudentCode] = useState<string | null>(null);

  const { data: semestersData } = useSemesters();
  const { data: classesData } = useClasses(
    departmentId !== 'all' ? { departmentId } : undefined,
  );
  const { data: departmentsData } = useDepartments();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Removed auto-set semesterId - let user choose "all" by default

  const filter: TuitionDebtFilter = useMemo(
    () => ({
      semesterId: semesterId || '', // Will be validated by enabled check in hook
      search: searchKeyword || undefined,
      classId: classId !== 'all' ? classId : undefined,
      departmentId: departmentId !== 'all' ? departmentId : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      pageNumber: currentPage,
      pageSize: PAGE_SIZE,
    }),
    [semesterId, searchKeyword, classId, departmentId, statusFilter, currentPage],
  );

  const {
    data: rawResponse,
    isLoading,
    isFetching,
    error,
  } = useTuitionDebts(filter);

  const response = rawResponse as TuitionDebtResponse | undefined;

  // getTuitionDebts returns: { statistics: {...}, data: { items: [...], totalCount: ... } }
  // So response = { statistics: {...}, data: { items: [...], totalCount: ... } }
  const debtItems = response?.data?.items ?? [];
  const statistics = response?.statistics ?? {
    totalFee: 0,
    totalPaid: 0,
    totalDebt: 0,
    overdue: 0,
  };
  const totalCount = response?.data?.totalCount ?? 0;
  const totalPages = Math.max(1, response?.data?.totalPages ?? 1);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (error) {
      toast.error(t('loadListError'));
    }
  }, [error, t]);

  const semesterOptions = useMemo(
    () => [
      { value: '', label: t('filters.semester.all') },
      ...(semestersData?.map((s) => ({
        value: s.semesterId,
        label: s.semesterName,
      })) ?? []),
    ],
    [semestersData, t],
  );

  const classOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.class.all') },
      ...(classesData?.map((c) => ({
        value: c.classId,
        label: c.className,
      })) ?? []),
    ],
    [classesData, t],
  );

  const departmentOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.department.all') },
      ...(departmentsData?.map((d) => ({
        value: d.departmentId,
        label: d.departmentName,
      })) ?? []),
    ],
    [departmentsData, t],
  );

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.status.all') },
      { value: 'paid', label: t('filters.status.paid') },
      { value: 'unpaid', label: t('filters.status.unpaid') },
      { value: 'overdue', label: t('filters.status.overdue') },
    ],
    [t],
  );

  const handleSelectItem = (studentCode: string, checked: boolean) => {
    const newSet = new Set(selectedStudentCodes);
    if (checked) {
      newSet.add(studentCode);
    } else {
      newSet.delete(studentCode);
    }
    setSelectedStudentCodes(newSet);
  };

  const handleViewDetail = (studentCode: string) => {
    setDetailStudentCode(studentCode);
  };

  const getStatusTranslation = (status: string): string => {
    if (status.includes('Đã thanh toán') || status.toLowerCase().includes('paid')) {
      return t('status.paid');
    }
    if (status.includes('Chưa thanh toán') || status.toLowerCase().includes('unpaid')) {
      return t('status.unpaid');
    }
    if (status.includes('Quá hạn') || status.toLowerCase().includes('overdue')) {
      return t('status.overdue');
    }
    return status;
  };

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (status.includes('Đã thanh toán') || statusLower.includes('paid')) {
      return 'bg-green-100 text-green-800';
    }
    if (status.includes('Chưa thanh toán') || statusLower.includes('unpaid')) {
      return 'bg-red-100 text-red-800';
    }
    if (status.includes('Quá hạn') || statusLower.includes('overdue')) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const formatCurrencyValue = (value: number): string => {
    return formatCurrency(value).replace('₫', '') + '₫';
  };

  const tableColumns: TableColumn[] = [
    { key: 'checkbox', label: '', align: 'center' },
    { key: 'studentCode', label: t('table.columns.studentCode') },
    { key: 'fullName', label: t('table.columns.fullName') },
    { key: 'major', label: t('table.columns.major') },
    { key: 'className', label: t('table.columns.className') },
    { key: 'totalFee', label: t('table.columns.totalFee') },
    { key: 'debt', label: t('table.columns.debt') },
    { key: 'deadline', label: t('table.columns.deadline') },
    { key: 'status', label: t('table.columns.status'), align: 'center' },
    { key: 'actions', label: t('table.columns.actions'), align: 'center' },
  ];


  return (
    <>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('pageDescription')}</p>
        </div>

        {/* Stat Cards - Statistics update based on current filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <TuitionStatCard
            label={t('stats.totalFee')}
            value={statistics.totalFee}
            Icon={DollarSign}
            bgColor="bg-blue-100/80"
            iconColor="text-blue-700"
          />
          <TuitionStatCard
            label={t('stats.totalPaid')}
            value={statistics.totalPaid}
            Icon={CheckCircle2}
            bgColor="bg-green-100/80"
            iconColor="text-green-700"
          />
          <TuitionStatCard
            label={t('stats.totalDebt')}
            value={statistics.totalDebt}
            Icon={AlertCircle}
            bgColor="bg-red-100/80"
            iconColor="text-red-700"
          />
          <TuitionStatCard
            label={t('stats.overdue')}
            value={statistics.overdue}
            Icon={Clock}
            bgColor="bg-orange-100/80"
            iconColor="text-orange-700"
          />
        </div>

        {/* Debt List */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-gray-200 p-4 lg:p-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('list.title')}</h2>
              {isFetching && <p className="text-xs text-gray-500">{t('list.syncing')}</p>}
            </div>

            <div className="flex flex-nowrap items-center gap-3 overflow-x-auto">
              <div className="relative min-w-0 flex-1">
                <SearchInput
                  placeholder={t('filters.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="flex-shrink-0 w-56">
                <Dropdown
                  options={semesterOptions}
                  value={semesterId}
                  onChange={(value) => {
                    setSemesterId(value ?? '');
                    setCurrentPage(1);
                  }}
                  placeholder={t('filters.semester.placeholder')}
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={classOptions}
                  value={classId}
                  onChange={(value) => {
                    setClassId(value ?? 'all');
                    setCurrentPage(1);
                  }}
                  placeholder={t('filters.class.placeholder')}
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={departmentOptions}
                  value={departmentId}
                  onChange={(value) => {
                    setDepartmentId(value ?? 'all');
                    setCurrentPage(1);
                  }}
                  placeholder={t('filters.department.placeholder')}
                />
              </div>
              <div className="flex-shrink-0 w-48">
                <Dropdown
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value ?? 'all');
                    setCurrentPage(1);
                  }}
                  placeholder={t('filters.status.placeholder')}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="px-4 py-6 lg:px-6">
            {error ? (
              <div className="rounded-2xl border border-dashed border-red-200 p-8 text-center text-red-600">
                {t('list.states.error')}
              </div>
            ) : isLoading ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                {t('list.states.loading')}
              </div>
            ) : debtItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                {t('list.states.empty')}
              </div>
            ) : (
              <Table
                columns={tableColumns}
                data={debtItems}
                renderRow={(item: TuitionDebtItem) => (
                  <>
                    <td className="px-6 py-4 text-center">
                      <Checkbox
                        checked={selectedStudentCodes.has(item.studentCode)}
                        onCheckedChange={(checked) =>
                          handleSelectItem(item.studentCode, checked === true)
                        }
                      />
                    </td>
                    <td className="px-6 py-4">{item.studentCode}</td>
                    <td className="px-6 py-4">{item.fullName}</td>
                    <td className="px-6 py-4">{item.major}</td>
                    <td className="px-6 py-4">{item.className}</td>
                    <td className="px-6 py-4 text-center">{formatCurrencyValue(item.totalFee)}</td>
                    <td className="px-6 py-4 text-center">{formatCurrencyValue(item.debt)}</td>
                    <td className="px-6 py-4">{formatDate(item.deadline)}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(item.status)}`}
                      >
                        {getStatusTranslation(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <TuitionDebtActionsMenu
                        onView={() => handleViewDetail(item.studentCode)}
                      />
                    </td>
                  </>
                )}
              />
            )}
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 px-4 py-4 lg:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <TuitionDebtDetailModal
        open={Boolean(detailStudentCode)}
        studentCode={detailStudentCode}
        onClose={() => setDetailStudentCode(null)}
      />
    </>
  );
}

