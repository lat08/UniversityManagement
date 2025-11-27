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