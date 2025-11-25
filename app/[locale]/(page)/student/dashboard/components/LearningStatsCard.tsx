"use client";

import { useEffect, useState, memo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { KpiData } from "../libs/types/types";
import { useCountUp } from "@/lib/hooks/useCountUp";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const getChartColors = () => {
  if (typeof window === "undefined") return { primary: "#ec4899", secondary: "#c4b5fd" };
  const root = getComputedStyle(document.documentElement);
  return {
    primary: root.getPropertyValue("--chart-primary").trim() || "#ec4899",
    secondary: root.getPropertyValue("--chart-secondary").trim() || "#c4b5fd",
  };
};

const LearningStatsCard = memo(({ Kpi }: KpiData) => {
  const t = useTranslations('student.dashboard');
  const [chartColors, setChartColors] = useState(getChartColors());
  const animatedGpa = useCountUp(Kpi?.gpa ?? 0, { duration: 1200 });
  const animatedCredits = useCountUp(Kpi?.completedCredits ?? 0, { duration: 1000 });
  const isLoading = !Kpi;

  useEffect(() => {
    const updateColors = () => setChartColors(getChartColors());
    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => observer.disconnect();
  }, []);

  const chartData = {
    labels: [t('stats.completed'), t('stats.remaining')],
    datasets: [
      {
        data: [Kpi?.completedCredits ?? 0, (Kpi?.totalCredits ?? 0) - (Kpi?.completedCredits ?? 0)],
        backgroundColor: [chartColors.primary, chartColors.secondary],
        borderWidth: 0,
        datalabels: {
          display: false,
        },
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
      datalabels: {
        display: false,
      },
    },
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold text-[var(--text-primary)] text-left">{t('stats.title')}</CardTitle>
        <div className="w-full h-px bg-[var(--border)] mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <>
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
              <div className="h-12 bg-gray-200 rounded w-32 mx-auto"></div>
              <div className="w-full h-px bg-[var(--border)]"></div>
            </div>
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto"></div>
              <div className="w-full h-px bg-[var(--border)]"></div>
            </div>
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-12 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="text-sm text-[var(--text-secondary)] text-center">{t('stats.cumulativeGpa')}</div>
              <div className="text-center">
                <span className="text-4xl font-bold text-[var(--primary)]">{animatedGpa.toFixed(2)}</span>
                <span className="text-lg text-[var(--text-secondary)] ml-1">/4</span>
              </div>
              <div className="w-full h-px bg-[var(--border)]"></div>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-[var(--text-secondary)] text-center">{t('stats.cumulativeCredits')}</div>
              <div className="relative">
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

                <div className="absolute top-0 right-0 space-y-1">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors.primary }}></div>
                    <span className="text-xs text-[var(--text-secondary)]">{t('stats.completed')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors.secondary }}></div>
                    <span className="text-xs text-[var(--text-secondary)]">{t('stats.remaining')}</span>
                  </div>
                </div>
              </div>
              <div className="w-full h-px bg-[var(--border)]"></div>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-[var(--text-secondary)] text-center">{t('stats.classification')}</div>
              <div className="text-center">
                <span className="inline-block px-6 py-3 bg-[var(--primary-light)] text-[var(--primary)] rounded-lg text-lg font-bold">
                  {Kpi?.ranking}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});
LearningStatsCard.displayName = "LearningStatsCard";

export default LearningStatsCard;