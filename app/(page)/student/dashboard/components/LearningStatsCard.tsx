"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { KpiData } from "../libs/types/types";
import { useCountUp } from "@/lib/hooks/useCountUp";

ChartJS.register(ArcElement, Tooltip, Legend);

const getChartColors = () => {
  if (typeof window === 'undefined') return { primary: '#ec4899', secondary: '#c4b5fd' };
  const root = getComputedStyle(document.documentElement);
  return {
    primary: root.getPropertyValue('--chart-primary').trim() || '#ec4899',
    secondary: root.getPropertyValue('--chart-secondary').trim() || '#c4b5fd',
  };
};

export default function LearningStatsCard({
Kpi
} : KpiData) {
  const [chartColors, setChartColors] = useState(getChartColors());
  const animatedGpa = useCountUp(Kpi?.gpa ?? 0, { duration: 1200 });
  const animatedCredits = useCountUp(Kpi?.completedCredits ?? 0, { duration: 1000 });

  useEffect(() => {
    const updateColors = () => setChartColors(getChartColors());
    updateColors();
    
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });
    
    return () => observer.disconnect();
  }, []);

  const chartData = {
    labels: ["Đã hoàn thành", "Còn lại"],
    datasets: [
      {
        data: [
          Kpi?.completedCredits ?? 0, 
          (Kpi?.totalCredits ?? 0) - (Kpi?.completedCredits ?? 0)
        ],
        backgroundColor: [chartColors.primary, chartColors.secondary],
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
              {animatedGpa.toFixed(2)}
            </span>
            <span className="text-lg text-[var(--text-secondary)] ml-1">
              /4
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
                    {animatedCredits}/{Kpi?.totalCredits}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Legend - Small and positioned at top right */}
            <div className="absolute top-0 right-0 space-y-1">
              <div className="flex items-center space-x-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: chartColors.primary }}
                ></div>
                <span className="text-xs text-[var(--text-secondary)]">Đã hoàn thành</span>
              </div>
              <div className="flex items-center space-x-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: chartColors.secondary }}
                ></div>
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
              {Kpi?.ranking}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

