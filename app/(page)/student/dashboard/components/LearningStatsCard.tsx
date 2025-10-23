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
        backgroundColor: ["#F87171", "#C4B5FD"], // Light red/coral and light purple
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
        <CardTitle className="text-base font-bold text-gray-900 text-center">
          Thống kê học tập
        </CardTitle>
        <div className="w-full h-px bg-gray-200 mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GPA Section */}
        <div className="space-y-2">
          <div className="text-sm text-gray-700 text-center">
            Điểm trung bình tích lũy
          </div>
          <div className="text-center">
            <span className="text-4xl font-bold text-blue-600">
              {learningStats.gpa}
            </span>
            <span className="text-lg text-gray-500 ml-1">
              /{learningStats.maxGpa}
            </span>
          </div>
          <div className="w-full h-px bg-gray-200"></div>
        </div>

        {/* Credits Section */}
        <div className="space-y-4">
          <div className="text-sm text-gray-700 text-center">
            Tín chỉ tích lũy
          </div>
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {learningStats.credits}/{learningStats.totalCredits}
                </span>
              </div>
            </div>
          </div>
          <div className="w-full h-px bg-gray-200"></div>
        </div>

        {/* Classification Section */}
        <div className="space-y-3">
          <div className="text-sm text-gray-700 text-center">
            Xếp loại
          </div>
          <div className="text-center">
            <span className="inline-block px-6 py-3 bg-blue-100 text-blue-800 rounded-lg text-lg font-bold">
              {learningStats.classification}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

