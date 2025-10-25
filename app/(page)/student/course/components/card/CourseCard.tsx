"use client"

import { Calendar, Clock, MapPin, User, Trash2 } from "lucide-react"
import { Card } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"

interface CourseCardProps {
  id: string
  name: string
  code: string
  credits: number
  instructor: string
  room: string
  startDate: string
  endDate: string
  schedule: string
  studentCount?: string
  onAction: (courseId: string, courseName: string) => void
  actionType: "register" | "cancel"
}

export function CourseCard({
  id,
  name,
  code,
  credits,
  instructor,
  room,
  startDate,
  endDate,
  schedule,
  studentCount,
  onAction,
  actionType,
}: CourseCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Course title and code */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base">{name}</h3>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-[var(--primary)] bg-[var(--primary-light)]">
              {code}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-[var(--primary-foreground)] bg-[var(--primary)]">
              {credits} tín chỉ
            </span>
          </div>

          {/* Course details */}
          <div className="space-y-2 text-sm text-gray-600" style={{marginLeft: '10px'}}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 flex-shrink-0" />
              <span>GV {instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{room}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Từ {startDate} đến {endDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{schedule}</span>
            </div>
            {studentCount && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 flex-shrink-0" />
                <span>{studentCount} sinh viên</span>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <Button
          onClick={() => onAction(id, name)}
          variant={actionType === "cancel" ? "destructive" : "default"}
          className={
            actionType === "cancel"
              ? "bg-[var(--error)] hover:bg-[var(--destructive-hover)] text-[var(--error-foreground)] shrink-0 cursor-pointer"
              : "text-[var(--primary-foreground)] shrink-0 cursor-pointer bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
          }
        >
          {actionType === "cancel" ? (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Hủy đăng ký
            </>
          ) : (
            "Đăng ký"
          )}
        </Button>
      </div>
    </Card>
  )
}