"use client";

import { useState, useCallback, useMemo, useEffect, lazy, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Tabs } from "@/app/components/ui/tabs";
import { useToast } from "@/app/components/ui/toast";
import { TuitionSkeleton } from "./components/tuition-skeleton";
import { InsuranceSkeleton } from "./components/insurance-skeleton";
import { PaymentHistorySkeleton } from "./components/payment-history-skeleton";
import { 
  useSemesters, 
  useTuitionData, 
  useInsuranceData, 
  usePaymentsData, 
  useInvalidateFinanceData,
  usePrefetchFinanceData 
} from "./lib/hooks/useFinanceQueries";
import type { TabType } from "./lib/types/types";

const QrPaymentModal = lazy(() => import("./components/qrPaymentModal"));
const TuitionTab = lazy(() => import("./components/tabs/TuitionTab"));
const InsuranceTab = lazy(() => import("./components/tabs/InsuranceTab"));
const PaymentHistoryTab = lazy(() => import("./components/tabs/PaymentHistoryTab"));

export default function TuitionPage() {
  const t = useTranslations('student.tuition');
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('tuition');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [, setQrIframeLoading] = useState(true);

  const { data: semesterData, isLoading: isSemestersLoading } = useSemesters();
  const { semesters = [], defaultSemesterId = null } = semesterData || {};
  const { prefetchInsurance, prefetchPayments } = usePrefetchFinanceData();

  useEffect(() => {
    if (defaultSemesterId && !selectedSemesterId) {
      setSelectedSemesterId(defaultSemesterId);
    }
  }, [defaultSemesterId, selectedSemesterId]);

  const effectiveSemesterId = selectedSemesterId || defaultSemesterId;

  const { 
    data: tuitionData, 
    isLoading: isTuitionLoading, 
    error: tuitionError 
  } = useTuitionData(effectiveSemesterId, activeTab === 'tuition');

  const { 
    data: insuranceData = [], 
    isLoading: isInsuranceLoading, 
    error: insuranceError 
  } = useInsuranceData(activeTab === 'insurance');

  const { 
    data: paymentsData = [], 
    isLoading: isPaymentsLoading, 
    error: paymentsError 
  } = usePaymentsData(activeTab === 'history');

  const { invalidateTuition, invalidateInsurance, invalidatePayments } = useInvalidateFinanceData();

  useEffect(() => {
    if (activeTab === 'tuition') {
      prefetchInsurance();
      prefetchPayments();
    }
  }, [activeTab, prefetchInsurance, prefetchPayments]);

  useEffect(() => {
    if (tuitionError && activeTab === 'tuition') {
      toast.error(tuitionError.message || t('loadError'));
    }
  }, [tuitionError, activeTab, toast, t]);

  useEffect(() => {
    if (insuranceError && activeTab === 'insurance') {
      toast.error(insuranceError.message || t('insuranceLoadError'));
    }
  }, [insuranceError, activeTab, toast, t]);

  useEffect(() => {
    if (paymentsError && activeTab === 'history') {
      toast.error(paymentsError.message || t('historyLoadError'));
    }
  }, [paymentsError, activeTab, toast, t]);

  const isInitialLoading = isSemestersLoading || (activeTab === 'tuition' && !effectiveSemesterId);

  const tabs = useMemo(() => [
    { id: 'tuition' as TabType, label: t('tuitionTab') },
    { id: 'insurance' as TabType, label: t('insuranceTab') },
    { id: 'history' as TabType, label: t('historyTab') },
  ], [t]);

  const closeQrModal = useCallback(() => {
    setIsQrOpen(false);
    setQrUrl(null);
    setPaymentId(null);
    setQrIframeLoading(true);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    if (activeTab === 'tuition') {
      invalidateTuition(effectiveSemesterId);
    } else if (activeTab === 'insurance') {
      invalidateInsurance();
    } else if (activeTab === 'history') {
      invalidatePayments();
    }
  }, [activeTab, effectiveSemesterId, invalidateTuition, invalidateInsurance, invalidatePayments]);

  if (isInitialLoading) {
    return (
      <div key="tuition-loading" className="animate-in fade-in duration-100 space-y-4 lg:space-y-6">
        <div>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
        <TuitionSkeleton />
      </div>
    );
  }

  return (
    <div key="tuition-content" className="animate-in fade-in duration-200 space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          {t('description')}
        </p>
      </div>

      <Tabs
        items={tabs.map(tab => ({ key: tab.id, label: tab.label }))}
        activeKey={activeTab}
        onChange={setActiveTab}
        disabled={isInitialLoading}
      />
      
      {(
        <>
          {activeTab === 'tuition' && (
            <Suspense fallback={<TuitionSkeleton />}>
              {isTuitionLoading ? (
                <TuitionSkeleton />
              ) : (
                <TuitionTab
                  tuitionData={tuitionData || null}
                  semesters={semesters}
                  selectedSemesterId={effectiveSemesterId}
                  onSemesterChange={setSelectedSemesterId}
                  setQrUrl={setQrUrl}
                  setPaymentId={setPaymentId}
                  setIsQrOpen={setIsQrOpen}
                  setQrIframeLoading={setQrIframeLoading}
                />
              )}
            </Suspense>
          )}

          {activeTab === 'insurance' && (
            <Suspense fallback={<InsuranceSkeleton />}>
              {isInsuranceLoading ? (
                <InsuranceSkeleton />
              ) : (
                <InsuranceTab
                  insurances={insuranceData}
                  setQrUrl={setQrUrl}
                  setPaymentId={setPaymentId}
                  setIsQrOpen={setIsQrOpen}
                  setQrIframeLoading={setQrIframeLoading}
                />
              )}
            </Suspense>
          )}

          {activeTab === 'history' && (
            <Suspense fallback={<PaymentHistorySkeleton />}>
              {isPaymentsLoading ? (
                <PaymentHistorySkeleton />
              ) : (
                <PaymentHistoryTab payments={paymentsData} />
              )}
            </Suspense>
          )}
        </>
      )}

      <Suspense fallback={null}>
        <QrPaymentModal
          isOpen={isQrOpen}
          qrUrl={qrUrl}
          paymentId={paymentId}
          onClose={closeQrModal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </Suspense>
    </div>
  );
}