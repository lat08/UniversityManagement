"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Filter, FileDown } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import TuitionTable from "./components/TuitionTable";
import InsuranceTable from "./components/InsuranceTable";
import PaymentHistoryTable from "./components/PaymentHistoryTable";
import PaymentSummary from "./components/PaymentSummary";
import InsuranceSummary from "./components/InsuranceSummary";
import { TabType, Insurance, Payment, TuitionFeeResponse } from "./lib/types/types";
import { getTuitionFees, getInsurances, getPayments, payCourses, paySemester, payInsurance, getPaymentExcel, getTuitionExcel, getInsuranceExcel } from "./lib/api/financeApi";
import { MOCK_SEMESTERS } from "./lib/constants/constants";
import { toast } from "sonner";
import { Spinner } from "@/app/components/ui/spinner";

export default function TuitionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tuition');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState({ semesterId: '1', semesterName: 'Học kỳ 1 - 2024/2025' });
  
  const [tuitionData, setTuitionData] = useState<TuitionFeeResponse['data'] | null>(null);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [selectedTuitionIds, setSelectedTuitionIds] = useState<string[]>([]);
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [tuitionRes, insuranceRes, paymentRes] = await Promise.all([
          getTuitionFees(),
          getInsurances(),
          getPayments()
        ]);
        
        if (tuitionRes.success) {
          setTuitionData(tuitionRes.data);
        } else {
          if (tuitionRes.message == "Không tìm thấy thông tin học phí.") 
            toast.error('Tải dữ liệu học phí thất bại: sinh viên chưa đăng ký môn học');
          else 
            toast.error('Tải dữ liệu học phí thất bại: ' + tuitionRes.message);
        }
        
        if (insuranceRes.success) {
          setInsurances(insuranceRes.data);
        } else {
          toast.error(insuranceRes.message || 'Tải dữ liệu bảo hiểm thất bại');
        }
        
        if (paymentRes.success) {
          setPayments(paymentRes.data);
        } else {
          toast.error(paymentRes.message || 'Tải dữ liệu lịch sử thanh toán thất bại');
        }
      } catch (error) {
        toast.error('Failed to load data. Please try again later.');
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleSelectAllTuition = (checked: boolean) => {
    if (!tuitionData) return;
    if (checked) {
      setSelectedTuitionIds(tuitionData.courses.map(course => course.courseId));
    } else {
      setSelectedTuitionIds([]);
    }
  };

  const handleSelectTuition = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTuitionIds([...selectedTuitionIds, id]);
    } else {
      setSelectedTuitionIds(selectedTuitionIds.filter(itemId => itemId !== id));
    }
  };

  const handleSelectInsurance = (id: string) => {
    setSelectedInsuranceId(selectedInsuranceId === id ? null : id);
  };

  const handleExportPayment = async () => {
    try {
      setIsLoading(true);
      await getPaymentExcel();
      toast.success('Đang tải xuống file lịch sử thanh toán');
    } catch (error) {
      toast.error('Không thể tải xuống file. Vui lòng thử lại sau.');
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportTuition = async () => {
    try {
      setIsLoading(true);
      await getTuitionExcel();
      toast.success('Đang tải xuống danh sách học phí');
    } catch (error) {
      toast.error('Không thể tải xuống file. Vui lòng thử lại sau.');
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportInsurance = async () => {
    try {
      setIsLoading(true);
      await getInsuranceExcel();
      toast.success('Đang tải xuống danh sách bảo hiểm');
    } catch (error) {
      toast.error('Không thể tải xuống file. Vui lòng thử lại sau.');
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (selectedTuitionIds.length === 0) {
      toast.error('Hãy chọn môn học để thanh toán');
      return;
    }

    try {
      setIsLoading(true);
      const res = await payCourses(selectedTuitionIds);
      if (res.success) {
        if (res.data) {
          // Open payment page in new window
          window.open(res.data, '_blank');
        }
        toast.success('Thanh toán thành công');
      } else {
        toast.error(res.message || 'Thanh toán thất bại');
      }
    } catch (error) {
      toast.error('Xử lý thanh toán không thành công');
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSemesterPayment = async () => {
    if (!tuitionData) {
      toast.error('No semester data available');
      return;
    }

    try {
      setIsLoading(true);
      const res = await paySemester(tuitionData.semesterId);
      if (res.success) {
        if (res.data) {
          // Open payment page in new window
          window.open(res.data, '_blank');
        }
        toast.success('Semester payment initiated successfully');
      } else {
        toast.error(res.message || 'Payment failed');
      }
    } catch (error) {
      toast.error('Failed to process semester payment');
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsurancePayment = async () => {
    if (!selectedInsuranceId) {
      toast.error('Vui lòng chọn bảo hiểm để thanh toán');
      return;
    }

    try {
      setIsLoading(true);
      const res = await payInsurance(selectedInsuranceId);
      if (res.success) {
        if (res.data) {
          window.open(res.data, '_blank');
        }
        toast.success('Thanh toán bảo hiểm thành công');
      } else {
        toast.error(res.message || 'Thanh toán thất bại');
      }
    } catch (error) {
      toast.error('Không thể xử lý thanh toán bảo hiểm');
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate selected items for summary
  const selectedTuitionItems = tuitionData?.courses.filter(
    course => selectedTuitionIds.includes(course.courseId)
  ) || [];

  const selectedInsuranceItems = selectedInsuranceId 
    ? insurances.filter(insurance => insurance.studentHealthInsuranceId === selectedInsuranceId)
    : [];

  const tabs = [
    { id: 'tuition' as TabType, label: 'Học phí' },
    { id: 'insurance' as TabType, label: 'Bảo hiểm' },
    { id: 'history' as TabType, label: 'Lịch sử thanh toán' },
  ];

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
      <div className="overflow-hidden">
        <div className="flex w-full border border-[var(--border)] rounded-lg bg-[var(--muted)] relative">
          {/* Active tab background slider */}
          <div 
            className="absolute top-0 bottom-0 bg-[var(--primary)] rounded-lg shadow-lg transition-all duration-300 ease-in-out z-0"
            style={{
              width: `${100 / tabs.length}%`,
              left: `${tabs.findIndex(t => t.id === activeTab) * (100 / tabs.length)}%`,
              transform: 'translateX(0)'
            }}
          />
          
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;

            return (
              <div key={tab.id} className="flex-1 relative z-10">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full cursor-pointer px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 relative transition-colors",
                    isActive
                      ? "text-[var(--primary-foreground)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <span className="relative z-10">{tab.label}</span>
                </button>
                
                {/* Divider */}
                {!isActive && index < tabs.length - 1 && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-6 bg-[var(--border)] transition-opacity duration-300"></div>
                )}
              </div>
            );
          })}
        </div>
                </div>
                
      {/* Tuition Tab */}
      {activeTab === 'tuition' && (
        <div className="space-y-4">
          {/* Header and Loading State */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base lg:text-lg font-bold text-gray-900">Danh sách học phí</h2>
              <p className="text-xs lg:text-sm text-gray-600">
                {isLoading ? 'Đang tải...' : `Thông tin học phí - ${tuitionData?.semesterName || ''}`}
              </p>
            </div>
            {isLoading ? (
              <Spinner />
            ) : (
              tuitionData && (
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs lg:text-sm font-medium">
                  {tuitionData.courses.length} môn học
                </div>
              )
            )}
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
            {/* Semester Info */}
            <div className="relative sm:flex-[1]">
              <button 
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none cursor-default transition-colors"
                disabled={true}
              >
                <span className="text-xs lg:text-sm text-gray-900 truncate">
                  {tuitionData ? tuitionData.semesterName : 'Loading...'}
                </span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-400 flex-shrink-0" />
              </button>
            </div>

            {/* Filter and Export Buttons */}
            <div className="flex gap-3 sm:flex-initial">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs lg:text-sm font-medium">Lọc</span>
              </button>
              <button
                onClick={handleExportTuition}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : <FileDown className="w-4 h-4" />}
                <span className="text-xs lg:text-sm font-medium">Xuất Excel</span>
              </button>
            </div>
          </div>
                
          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <TuitionTable 
              data={tuitionData?.courses || []}
              selectedIds={selectedTuitionIds}
              onSelectAll={handleSelectAllTuition}
              onSelectItem={handleSelectTuition}
              isLoading={isLoading}
            />
          </div>
                
          {/* Payment Summary */}
          <PaymentSummary 
            selectedItems={selectedTuitionItems}
            onPayment={handlePayment}
          />
        </div>
      )}

      {/* Insurance Tab */}
      {activeTab === 'insurance' && (
        <div className="space-y-4">
          {/* Header and Deadline */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base lg:text-lg font-bold text-gray-900">Danh sách bảo hiểm y tế</h2>
              <p className="text-xs lg:text-sm text-gray-600">Thông tin đóng bảo hiểm y tế theo học kỳ</p>
            </div>
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs lg:text-sm font-medium">
              Hạn đóng: 20/02/2025
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
            {/* Search Input */}
            <div className="sm:flex-[1]">
              <input
                type="text"
                placeholder="Tất cả năm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm"
              />
            </div>

            {/* Filter and Export Buttons */}
            <div className="flex gap-3 sm:flex-initial">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs lg:text-sm font-medium">Lọc</span>
              </button>
              <button
                onClick={handleExportInsurance}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : <FileDown className="w-4 h-4" />}
                <span className="text-xs lg:text-sm font-medium">Xuất Excel</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <InsuranceTable 
              data={insurances}
              selectedId={selectedInsuranceId}
              onSelectItem={handleSelectInsurance}
              isLoading={isLoading}
            />
          </div>

          {/* Insurance Summary */}
          <InsuranceSummary 
            selectedItems={selectedInsuranceItems}
            onPayment={handleInsurancePayment}
          />
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h2 className="text-base lg:text-lg font-bold text-gray-900">Lịch sử thanh toán</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
            {/* Search Input */}
            <div className="sm:flex-[1]">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm"
              />
            </div>

            {/* Semester Dropdown */}
            <div className="relative sm:flex-[1]">
              <button 
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-600 focus:outline-none cursor-pointer transition-colors"
                onClick={() => setIsSemesterOpen(!isSemesterOpen)}
              >
                <span className="text-xs lg:text-sm text-gray-900 truncate">
                  {selectedSemester.semesterName}
                </span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-700 flex-shrink-0" />
              </button>
              {isSemesterOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {MOCK_SEMESTERS.map((semester) => (
                    <button
                      key={semester.semesterId}
                      className="w-full text-left px-4 py-2.5 text-xs lg:text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setSelectedSemester(semester);
                        setIsSemesterOpen(false);
                      }}
                    >
                      {semester.semesterName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter and Export Buttons */}
            <div className="flex gap-3 sm:flex-initial">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs lg:text-sm font-medium">Lọc</span>
              </button>
              <button
                onClick={handleExportPayment}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : <FileDown className="w-4 h-4" />}
                <span className="text-xs lg:text-sm font-medium">Xuất Excel</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <PaymentHistoryTable data={payments} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
