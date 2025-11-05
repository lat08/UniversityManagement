"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Dropdown } from "@/app/components/ui";
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
    const [animatedData, setAnimatedData] = useState<number[]>([]);
    const [animatedBackgroundData, setAnimatedBackgroundData] = useState<number[]>([]);
    const [isChartReady, setIsChartReady] = useState(false);
    const animationRef = useRef<number | undefined>(undefined);
    const chartReadyTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const { semester, loading, error, refetch} = useAvailableSemester(selectedSemesterId);
    
    useEffect(() => {
      if (semesterId && semesterId !== selectedSemesterId) {
        setSelectedSemesterId(semesterId);
      }
    }, [semesterId]);
    
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

    useEffect(() => {
      if (!semester?.courses || loading) {
        setAnimatedData([]);
        setAnimatedBackgroundData([]);
        setIsChartReady(false);
        return;
      }

      const targetData = semester.courses.map((item) => item.finalScore);
      const initialData = new Array(targetData.length).fill(0);
      setAnimatedData(initialData);
      setAnimatedBackgroundData(new Array(targetData.length).fill(0));
      setIsChartReady(false);

      chartReadyTimeoutRef.current = setTimeout(() => {
        setIsChartReady(true);
      }, 300);

      return () => {
        if (chartReadyTimeoutRef.current) {
          clearTimeout(chartReadyTimeoutRef.current);
        }
      };
    }, [semester?.courses, loading]);

    useEffect(() => {
      if (!isChartReady || !semester?.courses || loading) {
        return;
      }

      const targetData = semester.courses.map((item) => item.finalScore);
      const startTime = performance.now();
      const columnDuration = 500;
      const staggerDelay = 100;
      let lastUpdateTime = 0;
      const updateInterval = 16;

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const now = performance.now();
        
        if (now - lastUpdateTime < updateInterval) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }
        
        lastUpdateTime = now;

        const currentData = targetData.map((target, index) => {
          const delay = index * staggerDelay;
          const columnStartTime = elapsed - delay;
          
          if (columnStartTime < 0) {
            return 0;
          }
          
          const progress = Math.min(columnStartTime / columnDuration, 1);
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          
          return Math.round(target * easeOutCubic * 10) / 10;
        });

        const currentBackgroundData = targetData.map((target, index) => {
          const delay = index * staggerDelay;
          const columnStartTime = elapsed - delay;
          const columnEndTime = columnStartTime + columnDuration;
          
          if (columnEndTime < 0 || columnStartTime < 0) {
            return 0;
          }
          
          if (elapsed >= columnEndTime) {
            return 10;
          }
          
          return 0;
        });

        setAnimatedData(currentData);
        setAnimatedBackgroundData(currentBackgroundData);

        const totalDuration = columnDuration + (targetData.length - 1) * staggerDelay;
        if (elapsed < totalDuration) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setAnimatedData(targetData);
          setAnimatedBackgroundData(new Array(targetData.length).fill(10));
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isChartReady, semester?.courses, loading]);

  const chartData = useMemo(() => {
    const displayData = animatedData.length > 0 
      ? animatedData 
      : (semester?.courses || []).map(() => 0);

    const displayBackgroundData = animatedBackgroundData.length > 0
      ? animatedBackgroundData
      : (semester?.courses || []).map(() => 0);

    return {
      labels: semester?.courses.map((item) => item.subjectName),
      datasets: [
        {
          data: displayData,
          backgroundColor: chartColors.primary,
          borderRadius: 0,
          barThickness: 40,
          borderSkipped: false,
          datalabels: {
            display: true,
          },
        },
        {
          data: displayBackgroundData,
          backgroundColor: chartColors.background,
          borderRadius: 0,
          barThickness: 40,
          borderSkipped: false,
          datalabels: {
            display: false,
          },
        },
      ],
    };
  }, [animatedData, animatedBackgroundData, semester?.courses, chartColors.primary, chartColors.background]);
      

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
          <div className="w-full sm:w-auto">
            <Dropdown
              options={semesters?.map((option) => ({
                value: option.semesterId,
                label: option.semesterName,
              })) || []}
              value={selectedSemesterId || ""}
              placeholder="Chọn học kỳ"
              onChange={(value) => setSelectedSemesterId(value)}
            />
          </div>
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

