"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/app/components/ui/chart"

const academicData = [
  { semester: "HK1", score: 7.2 },
  { semester: "HK2", score: 8.1 },
  { semester: "HK3", score: 7.8 },
  { semester: "HK4", score: 8.5 },
  { semester: "HK5", score: 7.9 },
  { semester: "HK6", score: 8.3 },
]

export function DashboardContent() {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-xs lg:text-sm text-gray-500">Chào mừng trở lại, Name!</p>
      </div>

      <div className="grid gap-3 lg:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Lịch học trong tuần</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">
              20 <span className="text-xs font-normal text-gray-500">Tiết</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">Lịch thi trong tuần</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">
              03 <span className="text-xs font-normal text-gray-500">Môn</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100 sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs lg:text-sm font-medium text-blue-900">THÔNG KÊ HỌC TẬP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs lg:text-sm">
              <span className="text-blue-700">Điểm TB tích lũy</span>
              <span className="font-semibold text-blue-900">3.45/4.0</span>
            </div>
            <div className="flex justify-between text-xs lg:text-sm">
              <span className="text-blue-700">Tín chỉ hoàn thành</span>
              <span className="font-semibold text-blue-900">45/120</span>
            </div>
            <div className="flex justify-between text-xs lg:text-sm">
              <span className="text-blue-700">Xếp loại</span>
              <span className="font-semibold text-blue-900">Giỏi</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm lg:text-base font-semibold">THÔNG TIN SINH VIÊN CHI TIẾT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 lg:space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="mb-2 lg:mb-3 text-xs lg:text-sm font-semibold text-gray-900">Thông tin cá nhân</h3>
            <div className="grid gap-2 lg:gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">MSSV</p>
                <p className="text-xs lg:text-sm font-medium">B1012302827</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">HỌ VÀ TÊN</p>
                <p className="text-xs lg:text-sm font-medium">Trần Nguyễn Văn A</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">NGÀY SINH</p>
                <p className="text-xs lg:text-sm font-medium">DD/MM/YYYY</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">GIỚI TÍNH</p>
                <p className="text-xs lg:text-sm font-medium">N2</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">NƠI SINH</p>
                <p className="text-xs lg:text-sm font-medium">SG QQQQ (QQQ)</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">CCCD</p>
                <p className="text-xs lg:text-sm font-medium">••••••••••</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="mb-2 lg:mb-3 text-xs lg:text-sm font-semibold text-gray-900">Thông tin khóa học</h3>
            <div className="grid gap-2 lg:gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">LỚP</p>
                <p className="text-xs lg:text-sm font-medium">23QPM</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">NGÀNH</p>
                <p className="text-xs lg:text-sm font-medium">Kỹ thuật & Khoa học máy tính</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">KHÓA</p>
                <p className="text-xs lg:text-sm font-medium">Khóa học máy tính</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">NĂM HỌC</p>
                <p className="text-xs lg:text-sm font-medium">2023 - 2027</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">CHUYÊN NGÀNH</p>
                <p className="text-xs lg:text-sm font-medium">Kỹ thuật phần mềm</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">ĐƠN VỊ ĐÀO TẠO</p>
                <p className="text-xs lg:text-sm font-medium">Đại học chính quy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Academic Results Chart */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-sm lg:text-base font-semibold">KẾT QUẢ HỌC TẬP</CardTitle>
            <select className="rounded-md border border-gray-300 px-2 lg:px-3 py-1 text-xs lg:text-sm w-full sm:w-auto">
              <option>Học kỳ 1 - Năm học 2025 - 2026</option>
            </select>
          </CardHeader>
          <CardContent className="min-w-0">
            <ChartContainer
              config={{
                score: {
                  label: "Điểm",
                  color: "hsl(217, 91%, 60%)",
                },
              }}
              className="h-[250px] lg:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={academicData} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="semester" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 12 }} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Reminders */}
        <Card className="bg-blue-50 border-blue-100 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm lg:text-base font-semibold text-blue-900">NHẮC NHỞ</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[200px] lg:min-h-[300px] flex items-start">
            <p className="text-xs lg:text-sm text-blue-700">Không có nhắc nhở mới</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm lg:text-base font-semibold">LỚP ĐĂNG THEO HỌC</CardTitle>
          <button className="text-sm text-blue-600 hover:underline">→</button>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4">
          <div>
            <h4 className="mb-2 text-xs lg:text-sm font-medium">Lập trình hướng đối tượng</h4>
            <div className="space-y-1 text-xs lg:text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <span className="text-gray-900">👤</span>
                TS.Nguyễn Văn A
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-900">⏰</span>
                Thứ 2, 7h - 10h
              </p>
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-xs lg:text-sm font-medium">Cấu trúc dữ liệu và giải thuật</h4>
            <div className="space-y-1 text-xs lg:text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <span className="text-gray-900">👤</span>
                PGS.TS.Trần TH B
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-900">⏰</span>
                Thứ 4, 13:00 - 16:30
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
