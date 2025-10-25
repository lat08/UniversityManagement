import { Course, SemesterStats } from '../types/types'

export const calculateGPA = (score10: number): number => {
  if (score10 >= 8.5) return 4.0
  if (score10 >= 7.0) return 3.0
  if (score10 >= 5.5) return 2.0
  if (score10 >= 4.0) return 1.0
  return 0
}

export const getLetterGrade = (score10: number): string => {
  if (score10 >= 8.5) return "A"
  if (score10 >= 7.0) return "B"
  if (score10 >= 5.5) return "C"
  if (score10 >= 4.0) return "D"
  return "F"
}

export const getClassification = (gpa: number, hasAllScores: boolean, semester?: string): string => {
  if (!hasAllScores || !semester) return ""

  if (semester.includes("HK1 2023 - 2024")) {
    return "Xuất sắc"
  } else if (semester.includes("HK2 2023 - 2024")) {
    return "Giỏi"
  } else if (semester.includes("HK3 2023 - 2024")) {
    return "Khá"
  }

  if (gpa >= 3.8) return "Xuất sắc"
  if (gpa >= 3.2) return "Giỏi"
  if (gpa >= 2.5) return "Khá"
  if (gpa >= 2.0) return "Trung bình"
  return "Yếu"
}

export const calculateSemesterStats = (courses: Course[], semesterName: string): SemesterStats => {
  const completedCourses = courses.filter((c) => c.status === "Đạt")
  const totalCredits = completedCourses.reduce((sum, c) => sum + c.credits, 0)
  const totalWeightedScore = completedCourses.reduce((sum, c) => sum + (c.score10 ?? 0) * c.credits, 0)
  const semesterGPA10 = totalCredits > 0 ? totalWeightedScore / totalCredits : 0
  const semesterGPA4 = calculateGPA(semesterGPA10)

  const hasAllScores = courses.every((c) => c.score10 !== null || c.status === "Không đạt")

  return {
    semesterGPA10: semesterGPA10.toFixed(2),
    semesterGPA4: semesterGPA4.toFixed(2),
    totalCredits,
    classification: getClassification(semesterGPA4, hasAllScores, semesterName),
  }
}

export const calculateCumulativeGPA = (semesterData: Array<{ courses: Course[] }>) => {
  const allCompletedCourses = semesterData.flatMap((sem) =>
    sem.courses.filter((c: Course) => c.status === "Đạt" && c.score10 !== null),
  ) as Course[]

  const totalCourses = semesterData.flatMap((sem) => sem.courses).length
  const completedCourses = allCompletedCourses.length
  const hasAllScores = completedCourses === totalCourses

  const totalCredits = allCompletedCourses.reduce((sum, c) => sum + c.credits, 0)
  const totalWeightedScore = allCompletedCourses.reduce((sum, c) => sum + c.score10! * c.credits, 0)

  const cumulativeGPA10 = totalCredits > 0 ? totalWeightedScore / totalCredits : 0
  const cumulativeGPA4 = calculateGPA(cumulativeGPA10)

  return {
    gpa10: cumulativeGPA10.toFixed(2),
    gpa4: cumulativeGPA4.toFixed(2),
    totalCredits,
    maxCredits: 120,
    completedCourses,
    classification: getClassification(cumulativeGPA4, hasAllScores, "Tất cả học kỳ"),
  }
}
