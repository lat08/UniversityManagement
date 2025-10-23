export interface StatCardData {
  title: string;
  value: number;
  unit: string;
  bgColor: string;
  iconColor: string;
}

export interface SubjectGrade {
  subject: string;
  grade: number;
}

export interface LearningStats {
  gpa: number;
  maxGpa: number;
  credits: number;
  totalCredits: number;
  classification: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  instructor: string;
  schedule: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
}

