"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import { Calendar, FileText } from "lucide-react";
import { StatCardData } from "../libs/types/types";
import { useCountUp } from "@/lib/hooks/useCountUp";

interface StatCardProps {
  data: StatCardData;
}

export default function StatCard({ data }: StatCardProps) {
  const Icon = data.title.includes("học") ? Calendar : FileText;
  const animatedValue = useCountUp(data.value, { duration: 800 });

  return (
    <Card className={`${data.bgColor} border-none shadow-sm`}>
      <CardContent className="p-6 relative">
        <div className="absolute top-4 right-4">
          <div className={`${data.iconColor} opacity-20`}>
            <Icon className="w-10 h-10" />
          </div>
        </div>

        <h3 className="text-sm text-[var(--text-secondary)] mb-4">
          {data.title}
        </h3>

        <div className={`text-5xl font-bold ${data.textColor} mb-1`}>
          {animatedValue}
        </div>

        <div className="text-sm text-[var(--text-secondary)]">
          {data.unit}
        </div>
      </CardContent>
    </Card>
  );
}

