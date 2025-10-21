"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Header } from "@/app/components/header/header";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { 
  CreditCard, 
  Download, 
  DollarSign, 
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle,
  Clock,
  ArrowUp
} from "lucide-react";

export default function PaymentPage() {
  const handleMobileMenuToggle = () => {
    // Handle mobile menu toggle
  };
  const bankInfo = {
    bank: "Vietcombank - Chi nhánh TP.HCM",
    accountNumber: "1234567890",
    accountHolder: "Trường Đại học Quốc tế Sài Gòn",
    content: "HOCPHI - [MSSV] - [HỌ TÊN]"
  };

  const directPaymentInfo = {
    address: "Tầng 1, Tòa nhà A - Thứ 2 đến Thứ 6, 8:00 - 17:00"
  };

  const tuitionData = {
    semester: "HK2 2024-2025",
    originalFee: 15000000,
    discount: -2000000,
    payableFee: 13000000,
    paid: 8000000,
    outstanding: 5000000,
    dueDate: "20/02/2025"
  };

  const paymentHistory = [
    {
      date: "15/01/2025",
      content: "Đóng học phí HK2 2024-2025 (Đợt 1)",
      amount: 8000000,
      method: "Chuyển khoản",
      status: "Đã thanh toán"
    },
    {
      date: "10/09/2024",
      content: "Đóng học phí HK1 2024-2025",
      amount: 13000000,
      method: "Tiền mặt",
      status: "Đã thanh toán"
    },
    {
      date: "15/02/2024",
      content: "Đóng học phí HK2 2023-2024",
      amount: 12500000,
      method: "Chuyển khoản",
      status: "Đã thanh toán"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  const formatDate = (dateString: string) => {
    return dateString;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onMobileMenuToggle={handleMobileMenuToggle} />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Học phí</h1>
          <p className="text-gray-500">Thông tin học phí và lịch sử thanh toán</p>
        </div>

        {/* 1. Học phí kỳ 2 & cảnh báo nợ */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-black">Học phí HK2 2024-2025</h3>
              </div>
              <Badge variant="destructive" className="bg-red-600 text-white px-3 py-1">
                Hạn đóng: {tuitionData.dueDate}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* 5 cards học phí */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center border border-gray-200 rounded-lg p-4 bg-white">
                <p className="text-sm text-gray-600 mb-2">Học phí chưa giảm</p>
                <p className="text-lg font-bold text-black">{formatCurrency(tuitionData.originalFee)}</p>
              </div>
              
              <div className="text-center border border-gray-200 rounded-lg p-4 bg-white">
                <p className="text-sm text-gray-600 mb-2">Miễn giảm</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(tuitionData.discount)}</p>
              </div>
              
              <div className="text-center border border-gray-200 rounded-lg p-4 bg-white">
                <p className="text-sm text-gray-600 mb-2">Học phí phải đóng</p>
                <p className="text-lg font-bold text-black">{formatCurrency(tuitionData.payableFee)}</p>
              </div>
              
              <div className="text-center border border-gray-200 rounded-lg p-4 bg-white">
                <p className="text-sm text-gray-600 mb-2">Đã thu</p>
                <p className="text-lg font-bold text-yellow-600">{formatCurrency(tuitionData.paid)}</p>
              </div>
              
              <div className="text-center border border-red-200 rounded-lg p-4 bg-red-50">
                <p className="text-sm text-black mb-2">Còn nợ</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(tuitionData.outstanding)}</p>
              </div>
            </div>

            {/* Alert cảnh báo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-black">Bạn còn nợ học phí {formatCurrency(tuitionData.outstanding)}</p>
                  <p className="text-sm text-black">Vui lòng thanh toán trước ngày {tuitionData.dueDate}</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Thanh toán ngay
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Thông tin thanh toán */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-black">Thông tin thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            {/* Box 1: Chuyển khoản ngân hàng */}
            <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-black mb-4">Chuyển khoản ngân hàng</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="text-black">{bankInfo.bank}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số tài khoản:</span>
                  <span className="text-black font-mono">{bankInfo.accountNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Chủ tài khoản:</span>
                  <span className="text-black">{bankInfo.accountHolder}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nội dung:</span>
                  <span className="text-black font-mono text-sm">{bankInfo.content}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Thanh toán trực tiếp */}
            <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-black mb-4">Thanh toán trực tiếp</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-semibold">Địa chỉ:</span> {directPaymentInfo.address}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Lịch sử thanh toán */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-xl font-bold text-black">Lịch sử thanh toán</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                <ArrowUp className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Ngày</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nội dung</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Số tiền</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Phương thức</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-black">{formatDate(payment.date)}</td>
                      <td className="py-3 px-4 text-black">{payment.content}</td>
                      <td className="py-3 px-4 text-right font-medium text-black">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3 px-4 text-black">{payment.method}</td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-medium">{payment.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
