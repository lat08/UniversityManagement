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
// Hàm chính: GET /api/semesters
// =============================================
export async function GET(request: Request) {
  console.log("=== RUNNING: /api/semesters/timetable/route.ts ==="); 
  try {
    // Truy vấn tất cả các học kỳ từ database
    const semesters = await prisma.hoc_ky.findMany({
      where: {
        ngay_xoa: null, // Chỉ lấy các học kỳ chưa bị xóa (áp dụng soft delete)
      },
      include: {
        // Bao gồm thông tin từ bảng 'nam_hoc' để có ngày bắt đầu/kết thúc năm học
        nam_hoc: {
          select: {
            ngay_bat_dau: true,
            ngay_ket_thuc: true,
          },
        },
      },
      orderBy: [
        { nam_hoc: { ngay_bat_dau: 'desc' } }, // Sắp xếp theo năm học mới nhất lên đầu
        { ngay_bat_dau: 'desc' },             // Sắp xếp theo học kỳ mới nhất trong năm lên đầu
      ],
    });

    // HTTP 200: Thành công, nhưng không có dữ liệu (theo yêu cầu của team).
    if (semesters.length === 0) {
        return NextResponse.json({
            code: 'EMPTY_DATA',
            message: 'Không tìm thấy học kỳ nào trong hệ thống.',
            data: []
        }, { status: 200 });
    }

    // Định dạng lại dữ liệu để phù hợp với hiển thị trên giao diện
    const formattedSemesters = semesters.map((semester) => {
        const startYear = new Date(semester.nam_hoc.ngay_bat_dau).getFullYear();
        const endYear = new Date(semester.nam_hoc.ngay_ket_thuc).getFullYear();
        const academicYearDisplay = startYear === endYear ? startYear.toString() : `${startYear}-${endYear}`;

        // Giữ nguyên tên học kỳ từ DB, không cần thay đổi logic này vì nó đã khá tốt.
        // Frontend có thể tùy chỉnh hiển thị nếu cần.
        const semesterNameDisplay = semester.ten_hoc_ky;

      return {
        id: semester.id_hoc_ky, 
        name: `${semesterNameDisplay} - Năm học ${academicYearDisplay}`, // Chuỗi hiển thị trên UI
        start_date: new Date(semester.ngay_bat_dau).toISOString().split('T')[0],
        end_date: new Date(semester.ngay_ket_thuc).toISOString().split('T')[0],
      };
    });

    // HTTP 200: Thành công, có dữ liệu trả về.
    return NextResponse.json({
        code: 'SUCCESS',
        message: 'Lấy danh sách học kỳ thành công.',
        data: formattedSemesters
    }, { status: 200 });

  } catch (error) {
    // Xử lý lỗi
    console.error('[API Error /semesters]:', error);

    // HTTP 500: Lỗi máy chủ nội bộ.
    return NextResponse.json(
      { 
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Lỗi máy chủ nội bộ khi lấy danh sách học kỳ.' 
      },
      { status: 500 }
    );
  }
}
