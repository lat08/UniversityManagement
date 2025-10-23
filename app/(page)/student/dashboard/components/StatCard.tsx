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
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs lg:text-sm text-gray-600 mb-2">
              {data.title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">
                {data.value}
              </span>
              <span className="text-xs lg:text-sm text-gray-500">
                {data.unit}
              </span>
            </div>
          </div>
          <div className={`${data.iconColor} opacity-20`}>
            <Icon className="w-10 h-10 lg:w-12 lg:h-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

