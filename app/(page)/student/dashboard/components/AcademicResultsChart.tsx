"use client";

import { useState } from "react";
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
} from "chart.js";
import { subjectGrades, semesterOptions } from "../libs/constants/dashboardConstant";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AcademicResultsChart() {
  const [selectedSemester, setSelectedSemester] = useState(semesterOptions[0].value);

  const chartData = {
    labels: subjectGrades.map((item) => item.subject),
    datasets: [
      {
        data: subjectGrades.map((item) => item.grade),
        backgroundColor: "var(--chart-6)",
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
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
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="text-xs lg:text-sm border border-[var(--input-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] w-full sm:w-auto"
          >
            {semesterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[300px] lg:h-[350px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}

