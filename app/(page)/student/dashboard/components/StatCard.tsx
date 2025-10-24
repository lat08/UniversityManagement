"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import { Calendar, FileText } from "lucide-react";
import { StatCardData } from "../libs/types/types";

interface StatCardProps {
  data: StatCardData;
}

export default function StatCard({ data }: StatCardProps) {
  const Icon = data.title.includes("học") ? Calendar : FileText;

  return (
    <Card className={`${data.bgColor} border-none shadow-sm`}>
      <CardContent className="p-6 relative">
        {/* Icon ở góc phải trên */}
        <div className="absolute top-4 right-4">
          <div className={`${data.iconColor} opacity-20`}>
            <Icon className="w-10 h-10" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm text-gray-500 mb-4">
          {data.title}
        </h3>

        {/* Value */}
        <div className={`text-5xl font-bold ${data.textColor} mb-1`}>
          {data.value}
        </div>

        {/* Unit */}
        <div className="text-sm text-gray-600">
          {data.unit}
        </div>
      </CardContent>
    </Card>
  );
}

