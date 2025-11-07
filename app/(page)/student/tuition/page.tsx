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
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [, setQrIframeLoading] = useState(true);

  // Sử dụng hook để tải dữ liệu ban đầu và quản lý loading state
  const { 
    isLoading: isInitialLoading, 
    tuitionData, 
    semesters,
    defaultSemesterId,
    insurances, 
    payments,
    refreshData // Thêm refreshData nếu cần
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
    setQrIframeLoading(true);
    refreshData(null);
    // Có thể gọi refreshData() tại đây nếu cần tải lại dữ liệu sau khi thanh toán
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
          setIsQrOpen={setIsQrOpen}
          setQrIframeLoading={setQrIframeLoading}
          semesters={semesters}
          defaultSemesterId={defaultSemesterId}
          refreshData={refreshData}
        />
      )}

      {activeTab === 'insurance' && (
        <InsuranceTab
          isLoading={isLoading}
          insurances={insurances}
          setIsLoading={setIsActionLoading}
          setQrUrl={setQrUrl}
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
        onClose={closeQrModal}
      />
    </div>
  );
}