import { InstructorSchedule } from '../types/types'

export const sampleSchedule: InstructorSchedule[] = [
  {
    id: "1",
    name: "QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN (3)",
    code: "CS3545",
    room: "D04-06",
    class: "SE1801",
    dayOfWeek: 4, // Thứ 4
    startPeriod: 1,
    periodsCount: 5,
    color: "blue",
    documents: ["Bài giảng tuần 4.pdf", "Slide Chapter 3.pptx", "Đề cương môn học.docx"],
  },
  {
    id: "2",
    name: "QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN (3) (Thực hành)",
    code: "CS3545",
    room: "D04501-Audi",
    class: "SE1802",
    dayOfWeek: 5, // Thứ 5
    startPeriod: 6,
    periodsCount: 4,
    color: "red",
    documents: ["Lab 3 - Project Management.pdf", "Template báo cáo.docx"],
  },
  {
    id: "3",
    name: "LẬP TRÌNH WEB NÂNG CAO",
    code: "CS4567",
    room: "D03-12",
    class: "SE1803",
    dayOfWeek: 3, // Thứ 3
    startPeriod: 8,
    periodsCount: 3,
    color: "green",
    documents: ["React Advanced Concepts.pdf", "Assignment 2.pdf"],
  },
]
