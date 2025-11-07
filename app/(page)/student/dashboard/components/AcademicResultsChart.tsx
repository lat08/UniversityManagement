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

const getChartColors = () => {
  if (typeof window === 'undefined') {
    return { 
      primary: '#ec4899', 
      background: '#c9c7c7',
      tooltipBg: '#ffffff',
      tooltipText: '#0f172a',
    };
  }
  const root = getComputedStyle(document.documentElement);
  return {
    primary: root.getPropertyValue('--chart-primary').trim() || '#ec4899',
    background: root.getPropertyValue('--chart-background').trim() || '#c9c7c7',
    tooltipBg: root.getPropertyValue('--chart-tooltip-bg').trim() || '#ffffff',
    tooltipText: root.getPropertyValue('--chart-tooltip-text').trim() || '#0f172a',
  };
};

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartDataLabels, Title, Tooltip, Legend);

export default function AcademicResultsChart({
  semesters,
  semesterId
} : SemesterChartData) {
    const [selectedSemesterId, setSelectedSemesterId] = useState<string>(() => semesterId || "");
    const [chartColors, setChartColors] = useState(getChartColors());
    const [animatedData, setAnimatedData] = useState<number[]>([]);
    const [animatedBackgroundData, setAnimatedBackgroundData] = useState<number[]>([]);
    const [isChartReady, setIsChartReady] = useState(false);
    const animationRef = useRef<number | undefined>(undefined);
    const chartReadyTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const initializedRef = useRef(false);

    const { semester, loading, error, refetch} = useAvailableSemester(selectedSemesterId);
    
    useEffect(() => {
      if (!initializedRef.current && semesterId) {
        setSelectedSemesterId(semesterId);
        initializedRef.current = true;
      }
    }, [semesterId]);
    
      useEffect(() => {
        if (selectedSemesterId) refetch();
      }, [selectedSemesterId, refetch]);

    useEffect(() => {
      const updateColors = () => setChartColors(getChartColors());
      updateColors();
      
      const observer = new MutationObserver(updateColors);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style']
      });
      
      return () => {
        observer.disconnect();
        if (tooltipRef.current) {
          document.body.removeChild(tooltipRef.current);
          tooltipRef.current = null;
        }
      };
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

  // Helper function to wrap text into multiple lines
  const wrapText = (text: string, maxCharsPerLine: number = 15): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length > maxCharsPerLine && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    // Limit to 3 lines maximum
    return lines.slice(0, 3);
  };

  const chartData = useMemo(() => {
    const displayData = animatedData.length > 0 
      ? animatedData 
      : (semester?.courses || []).map(() => 0);

    const displayBackgroundData = animatedBackgroundData.length > 0
      ? animatedBackgroundData
      : (semester?.courses || []).map(() => 0);

    return {
      labels: semester?.courses.map((item) => wrapText(item.subjectName)),
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
        enabled: false,
        external: function (context) {
          const tooltipModel = context.tooltip;
          if (!tooltipModel || tooltipModel.opacity === 0) {
            if (tooltipRef.current) {
              tooltipRef.current.style.opacity = '0';
            }
            return;
          }

          const index = tooltipModel.dataPoints[0]?.dataIndex;
          if (index === undefined || !semester?.courses) return;

          const course = semester.courses[index];
          const score = tooltipModel.dataPoints[0]?.parsed.y ?? 0;
          const isPassed = score >= 5.0;
          const status = isPassed ? 'Đạt' : 'Chưa đạt';

          if (!tooltipRef.current) {
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'chart-tooltip';
            tooltipEl.style.position = 'fixed';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.opacity = '0';
            tooltipEl.style.transition = 'opacity 0.3s';
            tooltipEl.style.zIndex = '9999';
            tooltipEl.style.maxWidth = '280px';
            document.body.appendChild(tooltipEl);
            tooltipRef.current = tooltipEl;
          }

          const tooltipEl = tooltipRef.current;
          const chart = context.chart as { canvas: HTMLCanvasElement };
          const canvasRect = chart.canvas.getBoundingClientRect();
          const chartX = canvasRect.left + tooltipModel.caretX;
          const chartY = canvasRect.top + tooltipModel.caretY;

          tooltipEl.innerHTML = `
            <div style="
              background: ${chartColors.tooltipBg};
              color: ${chartColors.tooltipText};
              padding: 12px;
              border-radius: 6px;
              font-size: 12px;
              line-height: 1.6;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            ">
              ${course?.subjectCode ? `<div><strong>Mã môn:</strong> ${course.subjectCode}</div>` : ''}
              ${course?.subjectName ? `<div><strong>Tên môn:</strong> ${course.subjectName}</div>` : ''}
              ${course?.credits ? `<div><strong>Số tín chỉ:</strong> ${course.credits}</div>` : ''}
              <div><strong>Điểm TK:</strong> ${score.toFixed(1)}</div>
              <div><strong>Đạt HP:</strong> ${status}</div>
            </div>
          `;

          tooltipEl.style.opacity = '1';
          
          const tooltipRect = tooltipEl.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const padding = 12;
          const offsetY = 4;

          let left = chartX;
          let top = chartY - tooltipRect.height - offsetY;
          const transformX = 'translateX(-50%)';
          let transformY = 'translateY(0)';

          if (left - tooltipRect.width / 2 < padding) {
            left = padding + tooltipRect.width / 2;
          } else if (left + tooltipRect.width / 2 > viewportWidth - padding) {
            left = viewportWidth - padding - tooltipRect.width / 2;
          }

          if (top < padding) {
            top = chartY + offsetY;
            transformY = 'translateY(0)';
          } else if (top + tooltipRect.height > viewportHeight - padding) {
            top = viewportHeight - padding - tooltipRect.height;
          }

          tooltipEl.style.left = `${left}px`;
          tooltipEl.style.top = `${top}px`;
          tooltipEl.style.transform = `${transformX} ${transformY}`;
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
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
          padding: 5,
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
        {loading ? (
          <div className="h-[300px] lg:h-[350px] flex items-center justify-center">
            <span className="text-[var(--text-secondary)] text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div className="h-[300px] lg:h-[350px] flex items-center justify-center">
            <span className="text-[var(--error)] text-sm">Lỗi khi tải dữ liệu: {error}</span>
          </div>
        ) : !semester?.courses?.length ? (
          <div className="h-[300px] lg:h-[350px] flex items-center justify-center">
            <span className="text-[var(--text-secondary)] text-sm">Không có môn học trong học kỳ này.</span>
          </div>
        ) : (
          <div className="h-[300px] lg:h-[350px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

