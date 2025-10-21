import { Calendar, Clock, MapPin, Users, FileText } from "lucide-react"
import { Card } from "@/app/components/ui/card"
import { cn } from "@/lib/utils/utils"
import { ExamCardProps, statusConfig } from "@/public/data/exam-schedule"



export function ExamCard({
  courseName,
  courseCode,
  date,
  time,
  duration,
  room,
  studentCount,
  examType,
  status,
}: ExamCardProps) {
  const config = statusConfig[status]

  return (
    <Card className={cn("p-4 border-1 relative", config.borderColor)}>
      {config.label && (
        <div className="absolute -top-3 right-[-10px]">
          <span className={cn("px-3 py-1 rounded-tl-[2px] rounded-tr-[2px] rounded-bl-[2px] text-sm font-medium", config.badgeColor)}>{config.label}
              <span className="absolute bottom-[-10.75px] right-[-0.5px] w-2.25 h-2.25 border-r-[10px] border-r-transparent border-t-[10px] border-t-gray-400"></span>
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-900">{courseName}</h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{courseCode}</span>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{date}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>
            {time} ({duration})
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>{room}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-4 w-4 flex-shrink-0" />
          <span>{studentCount} sinh viên</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <FileText className="h-4 w-4 flex-shrink-0" />
          <span>{examType}</span>
        </div>
      </div>
    </Card>
  )
}