import { SemesterGrade, SemesterData, Course, GradeItem } from '../types/types'
import { Semester } from '@/lib/types/common'

export const transformSemesterGradeToUI = (semesterGrade: SemesterGrade): SemesterData => {
  return {
    id: semesterGrade.semesterId,
    semester: semesterGrade.semesterName,
    courses: semesterGrade.grades.map(transformGradeItemToCourse),
  }
}

export const transformGradeItemToCourse = (gradeItem: GradeItem): Course => {
  return {
    code: gradeItem.subjectCode,
    name: gradeItem.subjectName,
    credits: gradeItem.credits,
    finalGrade: gradeItem.finalGrade,
    finalGrade10: gradeItem.finalGrade10,
    finalGrade4: gradeItem.finalGrade4,
    gradeLetter: gradeItem.gradeLetter,
    status: gradeItem.status,
  }
}

export const transformSemestersToUI = (
  semesters: SemesterGrade[], 
  commonSemesters?: Semester[]
): SemesterData[] => {
  // Sort semesters by startDate (newest first)
  const sorted = [...semesters].sort((a, b) => {
    if (!commonSemesters || commonSemesters.length === 0) {
      // Fallback: sort by name if no common semesters data
      return b.semesterName.localeCompare(a.semesterName)
    }
    
    const semesterA = commonSemesters.find(s => s.semesterId === a.semesterId)
    const semesterB = commonSemesters.find(s => s.semesterId === b.semesterId)
    
    if (!semesterA || !semesterB) {
      // Fallback: sort by name if semester not found
      return b.semesterName.localeCompare(a.semesterName)
    }
    
    // Sort by startDate descending (newest first)
    const dateA = new Date(semesterA.startDate).getTime()
    const dateB = new Date(semesterB.startDate).getTime()
    
    return dateB - dateA
  })
  
  console.log('Sorted semesters:', sorted.map(s => s.semesterName))
  
  return sorted.map(transformSemesterGradeToUI)
}

export const createCourseDetailsLookup = (gradeItem: GradeItem) => {
  const result = {
    name: gradeItem.subjectName,
    components: [
      {
        stt: 1,
        name: 'Chuyên cần và Thái độ HT',
        weight: 20,
        score: gradeItem.attendanceGrade ?? 0,
      },
      {
        stt: 2,
        name: 'Kiểm tra',
        weight: 30,
        score: gradeItem.midtermGrade ?? 0,
      },
      {
        stt: 3,
        name: 'Điểm thi',
        weight: 50,
        score: gradeItem.finalGrade ?? 0,
      },
    ],
  }
  
  console.log('createCourseDetailsLookup for', gradeItem.subjectCode, ':', {
    input: {
      attendance: gradeItem.attendanceGrade,
      midterm: gradeItem.midtermGrade,
      final: gradeItem.finalGrade,
    },
    output: result.components.map(c => ({ name: c.name, score: c.score }))
  })
  
  return result
}