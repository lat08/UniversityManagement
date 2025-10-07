import { type NextRequest, NextResponse } from 'next/server';
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
// CÁC HÀM HỖ TRỢ (HELPERS)
// =============================================

// Định dạng tên giảng viên từ "Họ Tên Đầy Đủ" -> "H.T.Đ.Đủ"
const formatLecturerName = (fullName: string | null | undefined): string => {
  if (!fullName) return 'Chưa có GV';
  const parts = fullName.split(' ').filter(Boolean);
  if (parts.length > 1) {
    const lastName = parts[parts.length - 1];
    const firstNamesInitials = parts.slice(0, -1).map(p => p[0].toUpperCase()).join('.');
    return `${firstNamesInitials}.${lastName}`;
  }
  return fullName;
};

// Định dạng ngày tháng -> "dd/MM/yy"
const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

// =============================================
// API ROUTE HANDLER
// =============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const semesterIdParam = searchParams.get('semesterId');
    const facultyIdParam = searchParams.get('facultyId');

    if (!semesterIdParam || !facultyIdParam) {
      return NextResponse.json(
        { message: 'Missing required parameters: semesterId and facultyId' },
        { status: 400 }
      );
    }

    const semesterId = parseInt(semesterIdParam, 10);
    const facultyId = parseInt(facultyIdParam, 10);

    if (isNaN(semesterId) || isNaN(facultyId)) {
      return NextResponse.json({ message: 'Invalid ID format. Must be a number.' }, { status: 400 });
    }
    
    console.log(`=== RUNNING: /api/semesters/timetable/faculties?semesterId=${semesterId}&facultyId=${facultyId} ===`);
    
    // Truy vấn các khóa học thuộc khoa và học kỳ đã chọn
    const courses = await prisma.khoa_hoc.findMany({
        where: {
          id_hoc_ky: semesterId,
          ngay_xoa: null,
          mon_hoc: {
            id_khoa: facultyId, // Lọc theo ID khoa
            ngay_xoa: null,
          }
        },
        include: {
          mon_hoc: true,
          giang_vien: { include: { nguoi: true } },
          lop: true,
          lich_hoc: {
            where: { ngay_xoa: null },
            include: {
              phong: true,
              ngay: {
                  include: {
                      tuan: {
                          include: {
                              hoc_ky: true
                          }
                      }
                  }
              },
            },
            orderBy: { ngay: { ngay_thang: 'asc' } },
          },
        },
      });

    if (courses.length === 0) {
        return NextResponse.json({ message: 'Không tìm thấy thời khóa biểu cho khoa trong học kỳ này.'}, { status: 404 });
    }

    // Xử lý và định dạng dữ liệu trả về
    const allScheduleEntries: any[] = [];
    courses.forEach(course => {
        course.lich_hoc.forEach(schedule => {
            allScheduleEntries.push({ course, schedule });
        });
    });

    const formattedTimetable = allScheduleEntries.map(entry => {
        const { course, schedule } = entry;
        const lessonCount = schedule.tiet_ket_thuc - schedule.tiet_bat_dau + 1;
        const hocKy = schedule.ngay?.tuan?.hoc_ky;
        const studyDuration = (hocKy) ? `${formatDate(hocKy.ngay_bat_dau)} đến ${formatDate(hocKy.ngay_ket_thuc)}` : 'N/A';
        
        return {
          ma_mh: course.mon_hoc.ma_mon_hoc,
          ten_mon_hoc: `${course.mon_hoc.ten_mon_hoc} (${course.mon_hoc.so_tin_chi})`,
          so_tin_chi: course.mon_hoc.so_tin_chi,
          nhom_to: `TV${String(course.id_khoa_hoc).padStart(3, '0')}`,
          lop: course.lop.ma_lop,
          thu: schedule.ngay.thu_tu_ngay,
          tiet_bat_dau: schedule.tiet_bat_dau,
          so_tiet: lessonCount,
          phong: schedule.phong.ma_phong,
          giang_vien: formatLecturerName(course.giang_vien.nguoi.ho_ten),
          thoi_gian_hoc: studyDuration,
        };
      });

    const uniqueSchedules = Array.from(new Map(formattedTimetable.map(item => [JSON.stringify(item), item])).values());
    
    // Sắp xếp lại kết quả cuối cùng
    uniqueSchedules.sort((a, b) => {
        if (a.ma_mh !== b.ma_mh) return a.ma_mh.localeCompare(b.ma_mh);
        if (a.thu !== b.thu) return a.thu - b.thu;
        return a.tiet_bat_dau - b.tiet_bat_dau;
    });

    return NextResponse.json(uniqueSchedules, { status: 200 });

  } catch (error) {
    console.error('[API_FACULTY_TIMETABLE_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}