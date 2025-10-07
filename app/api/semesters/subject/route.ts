import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Khởi tạo PrismaClient instance
// Sử dụng global object để tái sử dụng instance trong môi trường development.
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

// =============================================
// Hàm chính: GET /api/subjects
// Lấy toàn bộ danh sách môn học cho dropdown.
// =============================================
export async function GET(request: NextRequest) {
  console.log("=== RUNNING: /api/semesters/subject/route.ts ==="); 
  try {
    // Truy vấn tất cả môn học chưa bị xóa
    const subjects = await prisma.mon_hoc.findMany({
      where: {
        ngay_xoa: null,
      },
      orderBy: {
        ten_mon_hoc: 'asc', // Sắp xếp theo tên môn học (A-Z)
      },
    });

    // Định dạng lại dữ liệu trả về
    const formattedSubjects = subjects.map((subject) => {
      return {
        id: subject.id_mon_hoc,
        name: subject.ten_mon_hoc,
        code: subject.ma_mon_hoc,
        credits: subject.so_tin_chi,
      };
    });

    // Trả về danh sách môn học
    return NextResponse.json(formattedSubjects);
  } catch (error) {
    // Xử lý lỗi
    console.error('[API Error /subjects]:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ khi lấy danh sách môn học.' },
      { status: 500 }
    );
  }
}