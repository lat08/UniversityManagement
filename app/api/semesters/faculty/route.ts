import { NextResponse } from 'next/server';
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
// API ROUTE HANDLER: GET /api/faculties
// =============================================
export async function GET(request: Request) {
  console.log("=== RUNNING: /api//semesters/faculty/route.ts ==="); 
  try {
    // Truy vấn tất cả các khoa từ database
    const faculties = await prisma.khoa.findMany({
      where: {
        ngay_xoa: null, // Chỉ lấy các khoa chưa bị xóa (soft delete)
      },
      orderBy: {
        ten_khoa: 'asc', // Sắp xếp theo tên khoa (A-Z)
      },
    });

    // HTTP 200: Thành công, nhưng không có dữ liệu (theo yêu cầu của team).
    if (faculties.length === 0) {
        return NextResponse.json({
            code: 'EMPTY_DATA',
            message: 'Không tìm thấy khoa nào trong hệ thống.',
            data: []
        }, { status: 200 });
    }

    // Định dạng lại dữ liệu để phù hợp với hiển thị trên giao diện
    const formattedFaculties = faculties.map((faculty) => {
      return {
        id: faculty.id_khoa,      // ID của khoa, dùng làm giá trị (value)
        name: faculty.ten_khoa,  // Tên khoa, dùng để hiển thị
        code: faculty.ma_khoa,   // Mã khoa
      };
    });

    // HTTP 200: Thành công, có dữ liệu trả về.
    return NextResponse.json({
        code: 'SUCCESS',
        message: 'Lấy danh sách khoa thành công.',
        data: formattedFaculties
    }, { status: 200 });

  } catch (error) {
    // Xử lý lỗi nếu có sự cố xảy ra
    console.error('[API Error /faculties]:', error);

    // HTTP 500: Lỗi máy chủ nội bộ.
    return NextResponse.json(
      { 
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Lỗi máy chủ nội bộ khi lấy danh sách khoa.' 
      },
      { status: 500 }
    );
  }
}