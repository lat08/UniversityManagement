"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import { BookOpen, FileText, Pencil } from "lucide-react";
import { DashboardStatCard as DashboardStatCardType } from "../lib/types/types";

interface DashboardStatCardProps {
  data: DashboardStatCardType;
}

export default function DashboardStatCard({ data }: DashboardStatCardProps) {
  const getIcon = () => {
    if (data.title.includes("Lớp")) return BookOpen;
    if (data.title.includes("Tài liệu")) return FileText;
    return Pencil;
  };

  const Icon = getIcon();

  return (
      <Card className={`${data.bgColor} border-none shadow-sm`}>
      <CardContent className="p-4 lg:p-5 relative">
        <div className="absolute top-4 right-4">
          <div className={`${data.iconColor} opacity-10`}>
            <Icon className="w-10 h-10 lg:w-12 lg:h-12" />
          </div>
        </div>

        <h3 className="text-xs lg:text-sm text-gray-700 mb-3 font-medium">
          {data.title}
        </h3>

        <div className={`text-4xl lg:text-5xl font-bold ${data.textColor} mb-2`}>
          {data.value}
        </div>

        {data.subtitle && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>{data.subtitle}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

