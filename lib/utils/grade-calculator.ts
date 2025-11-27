import { GRADE_WEIGHTS, GRADE_RANGE } from "@/app/[locale]/(page)/instructor/grades/lib/constants";

export interface GradeInput {
  attendanceGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
}

export const calculateAverage = (grade: GradeInput): number | null => {
  const { attendanceGrade, midtermGrade, finalGrade } = grade;
  
  if (attendanceGrade === null || midtermGrade === null || finalGrade === null) {
    return null;
  }
  
  return parseFloat(
    (
      attendanceGrade * GRADE_WEIGHTS.ATTENDANCE +
      midtermGrade * GRADE_WEIGHTS.MIDTERM +
      finalGrade * GRADE_WEIGHTS.FINAL
    ).toFixed(1)
  );
};

export const validateGrade = (value: number | null): boolean => {
  if (value === null) return true;
  return value >= GRADE_RANGE.MIN && value <= GRADE_RANGE.MAX;
};

export const isGradeComplete = (grade: GradeInput): boolean => {
  return (
    grade.attendanceGrade !== null &&
    grade.midtermGrade !== null &&
    grade.finalGrade !== null
  );
};

export const formatGrade = (value: number | null): string => {
  return value !== null ? value.toFixed(1) : '-';
};
