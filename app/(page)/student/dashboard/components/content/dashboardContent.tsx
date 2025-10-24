"use client";

import StatCard from "../StatCard";
import AcademicResultsChart from "../AcademicResultsChart";
import LearningStatsCard from "../LearningStatsCard";
import EventCard from "../EventCard";
import ClassListCard from "../ClassListCard";
import { statCards } from "../../libs/constants/dashboardConstant";

export default function DashboardContent() {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
          Bảng điều khiển
        </h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          Chào mừng trở lại, Name!
        </p>
      </div>

      {/* Top Stats Row - Only 2 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} data={card} />
        ))}
      </div>

      {/* Academic Results and Learning Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">
        <div className="lg:col-span-8 h-full">
          <AcademicResultsChart />
        </div>
        <div className="lg:col-span-4 h-full">
          <LearningStatsCard />
        </div>
      </div>

      {/* Events and Classes Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">
        <div className="lg:col-span-8 h-full">
          <ClassListCard />
        </div>
        <div className="lg:col-span-4 h-full">
          <EventCard />
        </div>
      </div>
    </div>
  );
}
