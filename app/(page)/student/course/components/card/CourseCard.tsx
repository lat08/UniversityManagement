// Path: components/card/CourseCard.tsx

"use client"

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Clock, MapPin, User, Trash2, AlertCircle } from "lucide-react"
import { Card } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { CourseCardProps } from "../../lib/type/courseType" // <-- Dùng Props đã được sửa


export function CourseCard({
  courseId,
  subjectName,
  subjectCode,
  credits,
  instructorName,
  instructorCode,
  startDate,
  endDate,
  registrationStatus,
  weeklySchedules,
  onAction,          
  actionType = 'register',
  isAvailableForThisStudent,
  isFull,
  hasScheduleConflict,
  unavailabilityReason,
}: CourseCardProps) {
  // Format dates from ISO string to dd/MM/yyyy
  const formattedStartDate = format(new Date(startDate), 'dd/MM/yyyy', { locale: vi });
  const formattedEndDate = format(new Date(endDate), 'dd/MM/yyyy', { locale: vi });

  // Get first schedule (assuming array)
  const schedule = Array.isArray(weeklySchedules) ? weeklySchedules[0] : null;
  
  let buttonText = "Đăng ký";
  let buttonVariant: "default" | "destructive" = "default";
  let isDisabled = false;

  if (actionType === 'cancel') {
    buttonText = "Hủy đăng ký";
    buttonVariant = "destructive";
  } else { 
    buttonText = "Đăng ký";
    // Disable register button if not available for this student
    isDisabled = !isAvailableForThisStudent;
  }
  
  // Custom class cho màu nút theo design
  const buttonClassName = actionType === 'cancel' 
    ? "bg-[var(--error)] hover:bg-[var(--destructive-hover)] text-white"
    : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white";
  
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Course title and code */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base">{subjectName}</h3>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-[var(--primary)] bg-[var(--primary-light)]">
              {subjectCode}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-[var(--primary-foreground)] bg-[var(--primary)]">
              {credits} tín chỉ
            </span>
            {isFull && (
              <Badge variant="destructive" className="text-xs">
                Đã đầy
              </Badge>
            )}
            {hasScheduleConflict && (
              <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                Trùng lịch
              </Badge>
            )}
          </div>

          {/* Course details */}
          <div className="space-y-2 text-sm text-gray-600" style={{marginLeft: '10px'}}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 flex-shrink-0" />
              <span>GV {instructorName} ({instructorCode})</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{schedule?.roomCode} - {schedule?.roomName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Từ {formattedStartDate} đến {formattedEndDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{schedule?.dayOfWeekName} {schedule?.timeRange}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 flex-shrink-0" />
              <span>{registrationStatus}</span>
            </div>

            {/* Display unavailability reason if exists */}
            {unavailabilityReason && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{unavailabilityReason}</span>
              </div>
            )}
            
          </div>
        </div>

        {/* Action button */}
        <Button
          onClick={() => {
              if (actionType === 'cancel') {
                  onAction(courseId, subjectName); // Truyền ID và Tên môn cho Hủy
              } else {
                  onAction(courseId); // Chỉ truyền ID cho Đăng ký
              }
          }}
          variant={buttonVariant}
          className={buttonClassName}
          disabled={isDisabled}
        >
          {actionType === 'cancel' && <Trash2 className="h-4 w-4 mr-2" />}
          {buttonText}
        </Button>

      </div>
    </Card>
  )
}