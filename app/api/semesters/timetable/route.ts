// app/api/semesters/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Khởi tạo PrismaClient instance
// Sử dụng global object trong môi trường phát triển để tránh tạo quá nhiều instance.
// Điều này giúp ngăn chặn các lỗi "too many connections" trong quá trình hot reload của Next.js.
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
  console.log("=== ĐANG CHẠY: /api/semesters/timetable/route.ts ==="); // Thêm dòng này
  try {
    // Truy vấn tất cả các học kỳ từ database
    const semesters = await prisma.hoc_ky.findMany({
      where: {
        ngay_xoa: null, // Chỉ lấy các học kỳ chưa bị xóa (áp dụng soft delete)
      },
      include: {
        // Bao gồm thông tin từ bảng 'nam_hoc' để có ngày bắt đầu/kết thúc năm học
        // Điều này cần thiết để tạo chuỗi hiển thị "Năm học 2025 - 2026"
        nam_hoc: {
          select: {
            ngay_bat_dau: true,
            ngay_ket_thuc: true,
          },
        },
      },
      orderBy: [
        { nam_hoc: { ngay_bat_dau: 'desc' } }, // Sắp xếp chính theo ngày bắt đầu năm học giảm dần (năm học mới nhất lên đầu)
        { ngay_bat_dau: 'desc' }, // Sau đó sắp xếp theo ngày bắt đầu học kỳ giảm dần (học kỳ mới nhất trong năm lên đầu)
      ],
    });

    // Định dạng lại dữ liệu để phù hợp với hiển thị trên combobox hoặc danh sách trên giao diện
    const formattedSemesters = semesters.map((semester) => {
        // Lấy thông tin năm bắt đầu và kết thúc từ đối tượng 'nam_hoc' đã được include
        const startYear = semester.nam_hoc.ngay_bat_dau.getFullYear();
        const endYear = semester.nam_hoc.ngay_ket_thuc.getFullYear();
        
        // Tạo chuỗi hiển thị năm học: "2025" nếu cùng năm, hoặc "2025-2026" nếu khác năm
        const academicYearDisplay = startYear === endYear ? startYear.toString() : `${startYear}-${endYear}`;

        let semesterNameDisplay = semester.ten_hoc_ky;
        // Tùy chỉnh định dạng tên học kỳ cho thân thiện hơn trên UI
        // Ví dụ: "HK1" -> "Học kỳ 1", "HK2" -> "Học kỳ 2", "HKH" -> "Học kỳ hè", "HKP1" -> "Học kỳ phụ 1"
        if (semesterNameDisplay.startsWith('HKP')) { // Học kỳ phụ
            semesterNameDisplay = `Học kỳ phụ ${semesterNameDisplay.replace('HKP', '')}`;
        } else if (semesterNameDisplay.startsWith('HKH')) { // Học kỳ hè
            semesterNameDisplay = `Học kỳ hè ${semesterNameDisplay.replace('HKH', '')}`;
        } else if (semesterNameDisplay.startsWith('HK')) { // Học kỳ chính (HK1, HK2, ...)
            semesterNameDisplay = `Học kỳ ${semesterNameDisplay.replace('HK', '')}`;
        }

      return {
        id: semester.id_hoc_ky, // ID của học kỳ, dùng làm giá trị (value) khi người dùng chọn
        name: `${semesterNameDisplay} - Năm học ${academicYearDisplay}`, // Chuỗi hiển thị trên UI
        start_date: semester.ngay_bat_dau.toISOString().split('T')[0], // Ngày bắt đầu học kỳ (YYYY-MM-DD)
        end_date: semester.ngay_ket_thuc.toISOString().split('T')[0],   // Ngày kết thúc học kỳ (YYYY-MM-DD)
      };
    });

    // Trả về danh sách học kỳ đã được định dạng dưới dạng JSON
    return NextResponse.json(formattedSemesters);
  } catch (error) {
    // Xử lý lỗi nếu có bất kỳ sự cố nào xảy ra trong quá trình truy vấn hoặc định dạng
    console.error('[API Error /semesters]:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ khi lấy danh sách học kỳ.' },
      { status: 500 } // Trả về mã lỗi 500 (Internal Server Error)
    );
  }
}