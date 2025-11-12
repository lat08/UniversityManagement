"use client";

import { useState, useCallback, useMemo, useEffect, lazy, Suspense } from "react";
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
      toast.error(tuitionError.message || 'Tải dữ liệu học phí thất bại');
    }
  }, [tuitionError, activeTab, toast]);

  useEffect(() => {
    if (insuranceError && activeTab === 'insurance') {
      toast.error(insuranceError.message || 'Tải dữ liệu bảo hiểm thất bại');
    }
  }, [insuranceError, activeTab, toast]);

  useEffect(() => {
    if (paymentsError && activeTab === 'history') {
      toast.error(paymentsError.message || 'Tải dữ liệu lịch sử thất bại');
    }
  }, [paymentsError, activeTab, toast]);

  const isInitialLoading = isSemestersLoading || (activeTab === 'tuition' && !effectiveSemesterId);

  const tabs = useMemo(() => [
    { id: 'tuition' as TabType, label: 'Học phí' },
    { id: 'insurance' as TabType, label: 'Bảo hiểm' },
    { id: 'history' as TabType, label: 'Lịch sử thanh toán' },
  ], []);

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

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Tài chính</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          Thông tin học phí và lịch sử thanh toán
        </p>
      </div>

      <Tabs
        items={tabs.map(tab => ({ key: tab.id, label: tab.label }))}
        activeKey={activeTab}
        onChange={setActiveTab}
        disabled={isInitialLoading}
      />
      
      {isInitialLoading ? (
        <TuitionSkeleton />
      ) : (
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