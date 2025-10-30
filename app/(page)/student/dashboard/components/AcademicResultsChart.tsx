"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { SemesterChartData, } from "../libs/types/types";
import { useAvailableSemester } from "../libs/hooks/useAvailableSemester";
import toast from "react-hot-toast";

const getChartColors = () => {
  if (typeof window === 'undefined') return { primary: '#ec4899', background: '#c9c7c7' };
  const root = getComputedStyle(document.documentElement);
  return {
    primary: root.getPropertyValue('--chart-primary').trim() || '#ec4899',
    background: root.getPropertyValue('--chart-background').trim() || '#c9c7c7',
  };
};

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartDataLabels, Title, Tooltip, Legend);

export default function AcademicResultsChart({
  semesters,
  semesterId
} : SemesterChartData) {
    const [selectedSemesterId, setSelectedSemesterId] = useState<string>(semesterId);
    const [chartColors, setChartColors] = useState(getChartColors());

    const { semester, loading, error, refetch} = useAvailableSemester(selectedSemesterId);
    
    useEffect(() => {
        if (selectedSemesterId) refetch();
      }, [selectedSemesterId, refetch]);
        
      useEffect(() => {
        if (!loading) {
          if (!semester || !semester.courses || semester.courses.length === 0) {
            toast.error("Không tìm thấy kết quả học tập cho học kỳ này.");
          }
        }
      }, [semester, loading]);

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
    labels: semester?.courses.map((item) => item.subjectName),
    datasets: [
      {
        data: semester?.courses.map((item) => item.finalScore),
        backgroundColor: chartColors.primary,
        borderRadius: 0,
        barThickness: 40,
        borderSkipped: false,
        datalabels: {
          display: true,
        },
      },
      {
        data: semester?.courses.map(() => 10),
        backgroundColor: chartColors.background,
        borderRadius: 0,
        barThickness: 40,
        borderSkipped: false,
      },
    ],
  };
      

  const chartOptions : ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        color: chartColors.primary,
        anchor: "end",
        align: "top",
        offset: -4,
        font: {
          size: 12,
          weight: "bold",
        },
        formatter: (value: number) => value.toFixed(1),
      },
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "var(--card-bg)",
        padding: 12,
        titleColor: "var(--card-foreground)",
        bodyColor: "var(--card-foreground)",
        displayColors: false,
        callbacks: {
          label: function (context: { parsed: { y: number | null } }) {
            return `Điểm: ${context.parsed.y ?? 0}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "var(--text-secondary)",
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 10,
        grid: {
          color: "var(--border)",
        },
        ticks: {
          stepSize: 2,
          font: {
            size: 11,
          },
          color: "var(--text-secondary)",
        },
      },
    },
  };



  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-sm lg:text-base font-semibold">
            Kết quả học tập
          </CardTitle>
          <select
            value={selectedSemesterId || ""}
              onChange={(e) => {
                setSelectedSemesterId(e.target.value);
              }}
            className="text-xs lg:text-sm border border-[var(--input-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] w-full sm:w-auto"
          >
            {semesters?.map((option) => (
              <option key={option.semesterId} value={option.semesterId}>
                {option.semesterName}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[300px] lg:h-[350px] flex items-center justify-center">
          {loading ? (
            <span className="text-[var(--text-secondary)] text-sm">Đang tải dữ liệu...</span>
          ) : error ? (
            <span className="text-[var(--error)] text-sm">Lỗi khi tải dữ liệu: {error}</span>
          ) : !semester?.courses?.length ? (
            <span className="text-[var(--text-secondary)] text-sm">Không có môn học trong học kỳ này.</span>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

