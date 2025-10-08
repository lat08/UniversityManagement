import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

// =============================================
// KHỞI TẠO PRISMA CLIENT
// =============================================
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
  console.log("=== RUNNING: /api/semesters/subjects/route.ts ==="); 
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

    // HTTP 200: Thành công, nhưng không có dữ liệu (theo yêu cầu của team).
    if (subjects.length === 0) {
        return NextResponse.json({
            code: 'EMPTY_DATA',
            message: 'Không tìm thấy môn học nào trong hệ thống.',
            data: []
        }, { status: 200 });
    }

    // Định dạng lại dữ liệu trả về
    const formattedSubjects = subjects.map((subject) => {
      return {
        id: subject.id_mon_hoc,
        name: subject.ten_mon_hoc,
        code: subject.ma_mon_hoc,
        credits: subject.so_tin_chi,
      };
    });

    // HTTP 200: Thành công, có dữ liệu trả về.
    return NextResponse.json({
        code: 'SUCCESS',
        message: 'Lấy danh sách môn học thành công.',
        data: formattedSubjects
    }, { status: 200 });

  } catch (error) {
    // Xử lý lỗi
    console.error('[API Error /subjects]:', error);

    // HTTP 500: Lỗi máy chủ nội bộ.
    return NextResponse.json(
      { 
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Lỗi máy chủ nội bộ khi lấy danh sách môn học.' 
      },
      { status: 500 }
    );
  }
}