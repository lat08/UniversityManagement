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
// HÀM LOGIC CHÍNH ĐỂ LẤY DỮ LIỆU
// =============================================
async function getSubjectTimetable(subjectId: number, semesterId: number) {
  const courses = await prisma.khoa_hoc.findMany({
    where: {
      id_mon_hoc: subjectId,
      id_hoc_ky: semesterId,
      ngay_xoa: null,
    },
    include: {
      mon_hoc: true,
      giang_vien: {
        include: {
          nguoi: true,
        },
      },
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
        orderBy: {
          ngay: {
            ngay_thang: 'asc',
          },
        },
      },
    },
  });

  const allScheduleEntries: any[] = [];
  courses.forEach(course => {
      course.lich_hoc.forEach(schedule => {
          allScheduleEntries.push({
              course,
              schedule
          });
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
      nhom_to: `TV${String(course.id_khoa_hoc).padStart(3, '0')}`, // Ví dụ: TV001
      lop: course.lop.ma_lop,
      thu: schedule.ngay.thu_tu_ngay,
      tiet_bat_dau: schedule.tiet_bat_dau,
      so_tiet: lessonCount,
      phong: schedule.phong.ma_phong,
      giang_vien: formatLecturerName(course.giang_vien.nguoi.ho_ten),
      thoi_gian_hoc: studyDuration,
    };
  });

  // Nhóm các kết quả giống nhau lại (trường hợp một buổi học lặp lại nhiều tuần)
  const uniqueSchedules = Array.from(new Map(formattedTimetable.map(item => [JSON.stringify(item), item])).values());


  return uniqueSchedules;
}


// =============================================
// API ROUTE HANDLER
// =============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const semesterIdParam = searchParams.get('semesterId');
    const subjectIdParam = searchParams.get('subjectId');

    if (!semesterIdParam || !subjectIdParam) {
      return NextResponse.json(
        { message: 'Missing required parameters: semesterId and subjectId' },
        { status: 400 }
      );
    }

    const semesterId = parseInt(semesterIdParam, 10);
    const subjectId = parseInt(subjectIdParam, 10);

    if (isNaN(semesterId) || isNaN(subjectId)) {
      return NextResponse.json({ message: 'Invalid ID format. Must be a number.' }, { status: 400 });
    }
    
    console.log(`=== RUNNING: /api/semesters/timetable/subjects/route.ts ===`);
    
    // Gọi hàm logic ngay trong file này
    const data = await getSubjectTimetable(subjectId, semesterId);

    if (data.length === 0) {
        return NextResponse.json({ message: 'Không tìm thấy thời khóa biểu cho môn học trong học kỳ này.'}, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('[API_SUBJECT_TIMETABLE_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}