"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { User, Clock, ChevronRight } from "lucide-react";
import { currentClasses } from "../libs/constants/dashboardConstant";

export default function ClassListCard() {
  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm lg:text-base font-semibold">
            Lớp đang theo học
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        {currentClasses.map((classInfo) => (
          <div
            key={classInfo.id}
            className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm lg:text-base font-semibold text-gray-900 flex-1">
                {classInfo.name}
              </h4>
              <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded">
                {classInfo.id}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>{classInfo.instructor}</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{classInfo.schedule}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

