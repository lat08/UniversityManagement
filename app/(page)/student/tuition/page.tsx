// page.tsx
"use client";

import { useState } from "react";
import { TabType } from "./lib/types/types";
import { Tabs } from "@/app/components/ui/tabs";
import QrPaymentModal from "./components/qrPaymentModal";
import { useFinanceData } from "./lib/hooks/useFinanceData";

// Import các Tab mới
import TuitionTab from "./components/tabs/TuitionTab";
import InsuranceTab from "./components/tabs/InsuranceTab";
import PaymentHistoryTab from "./components/tabs/PaymentHistoryTab";

export default function TuitionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tuition');
  
  // States cho QR Modal
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [, setQrIframeLoading] = useState(true);
  const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(null);

  // Sử dụng hook để tải dữ liệu ban đầu và quản lý loading state
  const { 
    isLoading: isInitialLoading, 
    tuitionData, 
    semesters,
    defaultSemesterId,
    insurances, 
    payments,
    refreshData
  } = useFinanceData();
  
  // Tách biệt loading state cho các hành động (export, payment)
  const [isActionLoading, setIsActionLoading] = useState(false);
  const isLoading = isInitialLoading || isActionLoading;

  // Tabs structure
  const tabs = [
    { id: 'tuition' as TabType, label: 'Học phí' },
    { id: 'insurance' as TabType, label: 'Bảo hiểm' },
    { id: 'history' as TabType, label: 'Lịch sử thanh toán' },
  ];

  // QR modal actions
  const closeQrModal = () => {
    setIsQrOpen(false);
    setQrUrl(null);
    setPaymentId(null);
    setQrIframeLoading(true);
  };

  const handlePaymentSuccess = () => {
    // Refetch data với đúng semesterId hiện tại (cho học phí) hoặc null (cho bảo hiểm)
    // loadData sẽ refetch cả tuition, insurance và payments
    const semesterIdToRefresh = activeTab === 'tuition' ? currentSemesterId : null;
    refreshData(semesterIdToRefresh);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Tài chính</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          Thông tin học phí và lịch sử thanh toán
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        items={tabs.map(tab => ({ key: tab.id, label: tab.label }))}
        activeKey={activeTab}
        onChange={setActiveTab}
      />
                
      {/* Content based on Active Tab */}
      {activeTab === 'tuition' && (
        <TuitionTab
          isLoading={isLoading}
          tuitionData={tuitionData}
          setIsLoading={setIsActionLoading}
          setQrUrl={setQrUrl}
          setPaymentId={setPaymentId}
          setIsQrOpen={setIsQrOpen}
          setQrIframeLoading={setQrIframeLoading}
          semesters={semesters}
          defaultSemesterId={defaultSemesterId}
          refreshData={refreshData}
          setCurrentSemesterId={setCurrentSemesterId}
        />
      )}

      {activeTab === 'insurance' && (
        <InsuranceTab
          isLoading={isLoading}
          insurances={insurances}
          setIsLoading={setIsActionLoading}
          setQrUrl={setQrUrl}
          setPaymentId={setPaymentId}
          setIsQrOpen={setIsQrOpen}
          setQrIframeLoading={setQrIframeLoading}
        />
      )}

      {activeTab === 'history' && (
        <PaymentHistoryTab 
          isLoading={isLoading}
          payments={payments} 
          setIsLoading={setIsActionLoading}
        />
      )}
      
      {/* Nút thanh toán (Đã được chuyển vào trong TuitionTab/InsuranceTab's Summary component, nhưng giữ lại cái nút dưới cùng nếu nó là một nút chung không phụ thuộc tab) */}
      {/* <button onClick={handlePayment} className="btn-primary">
        Thanh toán
      </button> */}

      {/* Modal hiển thị QR */}
      <QrPaymentModal
        isOpen={isQrOpen}
        qrUrl={qrUrl}
        paymentId={paymentId}
        onClose={closeQrModal}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}