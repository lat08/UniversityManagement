import { SemesterGrade, SemesterData, Course, GradeItem } from '../types/types'

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
    score10: gradeItem.finalGrade10,
    status: gradeItem.status,
  }
}

export const transformSemestersToUI = (semesters: SemesterGrade[]): SemesterData[] => {
  return semesters.map(transformSemesterGradeToUI)
}

export const createCourseDetailsLookup = (gradeItem: GradeItem) => {
  return {
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
}