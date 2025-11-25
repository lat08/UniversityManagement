import { useMemo } from "react"

interface CourseItem {
  id: string
  name: string
  code: string
  room: string
  teacher?: string
  dayOfWeek: number
  startPeriod: number
  periodsCount: number
  courseType?: string
}

interface ConflictCourse {
  name: string
  code: string
  room: string
  teacher: string
  courseType: string
}

export interface Conflict {
  dayOfWeek: number
  period: number
  courses: ConflictCourse[]
}

export const useScheduleConflicts = (scheduleData: CourseItem[]): Conflict[] => {
  return useMemo(() => {
    const conflicts: Conflict[] = []
    const dayGroups = new Map<number, CourseItem[]>()
    
    scheduleData.forEach(course => {
      if (!dayGroups.has(course.dayOfWeek)) {
        dayGroups.set(course.dayOfWeek, [])
      }
      dayGroups.get(course.dayOfWeek)!.push(course)
    })

    dayGroups.forEach((courses, dayOfWeek) => {
      const sortedCourses = courses.sort((a, b) => a.startPeriod - b.startPeriod)
      
      for (let i = 0; i < sortedCourses.length; i++) {
        for (let j = i + 1; j < sortedCourses.length; j++) {
          const course1 = sortedCourses[i]
          const course2 = sortedCourses[j]
          
          const course1EndPeriod = course1.startPeriod + course1.periodsCount - 1
          const course2EndPeriod = course2.startPeriod + course2.periodsCount - 1
          
          const hasOverlap = course1.startPeriod <= course2EndPeriod && course1EndPeriod >= course2.startPeriod
          
          if (hasOverlap) {
            let existingConflict = conflicts.find(
              c => c.dayOfWeek === dayOfWeek && c.period === course1.startPeriod
            )
            
            if (!existingConflict) {
              existingConflict = {
                dayOfWeek,
                period: course1.startPeriod,
                courses: [course1, course2].map(course => ({
                  name: course.name,
                  code: course.code,
                  room: course.room,
                  teacher: course.teacher || '',
                  courseType: course.courseType || '',
                }))
              }
              conflicts.push(existingConflict)
            } else {
              const course2Exists = existingConflict.courses.some(c => c.code === course2.code)
              if (!course2Exists) {
                existingConflict.courses.push({
                  name: course2.name,
                  code: course2.code,
                  room: course2.room,
                  teacher: course2.teacher || '',
                  courseType: course2.courseType || '',
                })
              }
            }
          }
        }
      }
    })
    
    return conflicts
  }, [scheduleData])
}
