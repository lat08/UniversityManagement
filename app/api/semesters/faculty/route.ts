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
  console.log("=== RUNNING: /api/semesters/faculty/route.ts ==="); 
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

    // Định dạng lại dữ liệu để phù hợp với hiển thị trên giao diện
    const formattedFaculties = faculties.map((faculty) => {
      return {
        id: faculty.id_khoa,      // ID của khoa, dùng làm giá trị (value)
        name: faculty.ten_khoa,  // Tên khoa, dùng để hiển thị
        code: faculty.ma_khoa,   // Mã khoa
      };
    });

    // Trả về danh sách khoa đã được định dạng
    return NextResponse.json(formattedFaculties);
  } catch (error) {
    // Xử lý lỗi nếu có sự cố xảy ra
    console.error('[API Error /faculties]:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ khi lấy danh sách khoa.' },
      { status: 500 }
    );
  }
}
