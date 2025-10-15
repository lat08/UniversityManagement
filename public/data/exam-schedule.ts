//data structure

export type ExamStatus = "completed" | "upcoming" | "scheduled"

export interface ExamCardProps {
  courseName: string
  courseCode: string
  date: string
  time: string
  duration: string
  room: string
  studentCount: number
  examType: string
  status: ExamStatus
}

export const statusConfig = {
  completed: {
    label: "Đã thi",
    borderColor: "border-blue-400",
    badgeColor: "bg-blue-500 text-white",
  },
  upcoming: {
    label: "Sắp tới",
    borderColor: "border-red-800",
    badgeColor: "bg-red-700 text-white",
  },
  scheduled: {
    label: "",
    borderColor: "border-gray-200",
    badgeColor: "",
  },
}

//dummy data
export const examsData: ExamCardProps[] = [
  {
    courseName: "LISTENING 5",
    courseCode: "CTS53168",
    date: "Thứ 4, 02/05/2025",
    time: "8:00 - 8:30",
    duration: "30 phút",
    room: "Phòng DOA114",
    studentCount: 20,
    examType: "Trắc nghiệm và Tự luận",
    status: "completed",
  },
  {
    courseName: "PHƯƠNG PHÁP SỐ",
    courseCode: "CTS53168",
    date: "Thứ 6, 20/05/2025",
    time: "8:00 - 8:30",
    duration: "30 phút",
    room: "Phòng DOA114",
    studentCount: 20,
    examType: "Tự luận",
    status: "upcoming",
  },
  {
    courseName: "READING 5 & WRITING 5",
    courseCode: "CTS53168",
    date: "Thứ 4, 30/05/2025",
    time: "8:00 - 8:30",
    duration: "30 phút",
    room: "Phòng DOA114",
    studentCount: 20,
    examType: "Trắc nghiệm và Tự luận",
    status: "upcoming",
  },
  {
    courseName: "SPEAKING 5",
    courseCode: "CTS53168",
    date: "Thứ 4, 01/07/2025",
    time: "8:00 - 8:30",
    duration: "30 phút",
    room: "Phòng DOA114",
    studentCount: 20,
    examType: "Trắc nghiệm và Tự luận",
    status: "scheduled",
  },
]