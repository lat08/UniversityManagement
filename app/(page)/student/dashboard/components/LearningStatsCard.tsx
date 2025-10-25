"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { learningStats } from "../libs/constants/dashboardConstant";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function LearningStatsCard() {
  const chartData = {
    labels: ["Đã hoàn thành", "Còn lại"],
    datasets: [
      {
        data: [learningStats.credits, learningStats.totalCredits - learningStats.credits],
        backgroundColor: ["var(--chart-7)", "var(--chart-8)"], // Light red/coral and light purple
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold text-[var(--text-primary)] text-left">
          Thống kê học tập
        </CardTitle>
        <div className="w-full h-px bg-[var(--border)] mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GPA Section */}
        <div className="space-y-2">
          <div className="text-sm text-[var(--text-secondary)] text-center">
            Điểm trung bình tích lũy
          </div>
          <div className="text-center">
            <span className="text-4xl font-bold text-[var(--primary)]">
              {learningStats.gpa}
            </span>
            <span className="text-lg text-[var(--text-secondary)] ml-1">
              /{learningStats.maxGpa}
            </span>
          </div>
          <div className="w-full h-px bg-[var(--border)]"></div>
        </div>

        {/* Credits Section */}
        <div className="space-y-4">
          <div className="text-sm text-[var(--text-secondary)] text-center">
            Tín chỉ tích lũy
          </div>
          <div className="relative">
            {/* Chart */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                <Doughnut data={chartData} options={chartOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    {learningStats.credits}/{learningStats.totalCredits}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Legend - Small and positioned at top right */}
            <div className="absolute top-0 right-0 space-y-1">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-[var(--chart-7)]"></div>
                <span className="text-xs text-[var(--text-secondary)]">Đã hoàn thành</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-[var(--chart-8)]"></div>
                <span className="text-xs text-[var(--text-secondary)]">Còn lại</span>
              </div>
            </div>
          </div>
          <div className="w-full h-px bg-[var(--border)]"></div>
        </div>

        {/* Classification Section */}
        <div className="space-y-3">
          <div className="text-sm text-[var(--text-secondary)] text-center">
            Xếp loại
          </div>
          <div className="text-center">
            <span className="inline-block px-6 py-3 bg-[var(--primary-light)] text-[var(--primary)] rounded-lg text-lg font-bold">
              {learningStats.classification}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

