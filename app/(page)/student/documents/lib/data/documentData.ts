import { DocumentSection } from '../types/types'

export const documentSections: DocumentSection[] = [
  {
    title: 'Lập trình Web',
    subtitle: 'CS301 - TS. Nguyễn Văn Bangkok',
    fileCount: 3,
    documents: [
      {
        id: '1',
        name: 'Bài giảng bài 1 - Giới thiệu HTML/CSS',
        size: '2.5 MB',
        date: '01/02/2025',
        type: 'pdf'
      },
      {
        id: '2',
        name: 'Bài tập thực hành JavaScript',
        size: '1.8 MB',
        date: '05/02/2025',
        type: 'pdf'
      },
      {
        id: '3',
        name: 'Source code demo React',
        size: '5.2 MB',
        date: '08/02/2025',
        type: 'zip'
      }
    ]
  },
  {
    title: 'Cơ sở dữ liệu',
    subtitle: 'CS202 - PGS. Trần Thị Canada',
    fileCount: 2,
    documents: [
      {
        id: '4',
        name: 'Chương 1 - Mô hình quan hệ',
        size: '3.1 MB',
        date: '02/02/2025',
        type: 'pdf'
      },
      {
        id: '5',
        name: 'Bài tập SQL cơ bản',
        size: '1.2 MB',
        date: '06/02/2025',
        type: 'pdf'
      }
    ]
  },
  {
    title: 'Mạng máy tính',
    subtitle: 'CS304 - Tiến sĩ Vũ Domain',
    fileCount: 2,
    documents: [
      {
        id: '6',
        name: 'Bài giảng - Mô hình OSI',
        size: '4.2 MB',
        date: '03/02/2025',
        type: 'pptx'
      },
      {
        id: '7',
        name: 'Lab 1 - Cấu hình Router',
        size: '2.9 MB',
        date: '07/02/2025',
        type: 'pdf'
      }
    ]
  }
]
