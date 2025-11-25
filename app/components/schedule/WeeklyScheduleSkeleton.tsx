import { ChevronLeft, ChevronRight } from "lucide-react"
import { DAYS_OF_WEEK, PERIODS, PERIOD_TIMES, type DayOfWeekConfig } from "@/lib/constants/schedule"
import type { ScheduleTranslationFn } from "@/lib/types"

export const WeeklyScheduleSkeleton = ({ translate }: { translate?: ScheduleTranslationFn } = {}) => {
  const getDayLabel = (day: DayOfWeekConfig) =>
    translate ? translate(`days.${day.key}.short`) : day.label

  const getDayFullLabel = (day: DayOfWeekConfig) =>
    translate ? translate(`days.${day.key}.full`) : day.label

  const formatPeriodLabel = (period: number) =>
    translate ? translate('grid.period', { period }) : `Tiết ${period}`

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden p-3">
      <div>
        <div className="inline-block min-w-full align-middle">
          <div className="flex gap-2 mb-2">
            <div className="w-[90px] flex-shrink-0">
              <div className="w-full h-[60px] text-[var(--schedule-header-text)] rounded-lg flex items-center justify-center bg-[var(--schedule-header-bg)] opacity-50">
                <ChevronLeft className="w-5 h-5" />
              </div>
            </div>

            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day.value}
                className="flex-1 min-w-[120px] text-[var(--schedule-header-text)] rounded-lg flex flex-col items-center justify-center h-[60px] bg-[var(--schedule-header-bg)]"
              >
                <div className="font-semibold text-sm">{getDayLabel(day)}</div>
                <div className="text-xs mt-1">
                  <span className="sr-only">{getDayFullLabel(day)}</span>
                  <span className="block h-4 w-16 bg-gray-300 rounded animate-pulse" />
                </div>
              </div>
            ))}

            <div className="w-[90px] flex-shrink-0">
              <div className="w-full h-[60px] text-[var(--schedule-header-text)] rounded-lg flex items-center justify-center bg-[var(--schedule-header-bg)] opacity-50">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="relative">
            {PERIODS.map((period) => (
              <div key={period} className="flex gap-2 mb-2">
                <div className="w-[90px] flex-shrink-0 text-[var(--schedule-header-text)] rounded-lg flex items-center justify-center font-semibold text-sm h-[52px] bg-[var(--schedule-header-bg)]">
                  {formatPeriodLabel(period)}
                </div>

                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={`${day.value}-${period}`}
                    className="flex-1 min-w-[100px] bg-[var(--schedule-empty-bg)] border border-[var(--schedule-empty-border)] rounded-lg h-[52px] animate-pulse"
                  />
                ))}

                <div className="w-[90px] flex-shrink-0 text-[var(--schedule-header-text)] rounded-lg flex items-center justify-center font-semibold text-sm h-[52px] bg-[var(--schedule-header-bg)]">
                  {PERIOD_TIMES.find((p) => p.period === period)?.time || ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
