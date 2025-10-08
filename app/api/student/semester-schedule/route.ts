import { type NextRequest, NextResponse } from "next/server";
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

// Tối ưu: Dữ liệu thời gian được định nghĩa một lần và tái sử dụng.
const periodTimes: { [key: number]: { start: string, end: string } } = {
    1: { start: "07:15", end: "08:05" },
    2: { start: "08:05", end: "09:10" },
    3: { start: "09:10", end: "10:00" },
    4: { start: "10:00", end: "10:50" },
    5: { start: "10:50", end: "11:40" },
    6: { start: "13:30", end: "14:20" },
    7: { start: "14:20", end: "15:20" },
    8: { start: "15:20", end: "16:10" },
    9: { start: "16:10", end: "17:00" },
    10: { start: "17:30", end: "18:20" },
    11: { start: "18:20", end: "19:20" },
    12: { start: "19:20", end: "20:10" },
    13: { start: "20:10", end: "21:00" },
};

const getTimeRangeForPeriods = (startPeriod: number, endPeriod: number): string => {
  const startTime = periodTimes[startPeriod]?.start;
  const endTime = periodTimes[endPeriod]?.end;
  return (startTime && endTime) ? `${startTime} – ${endTime}` : "Không xác định";
};

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

// =============================================
// API ROUTE HANDLER
// =============================================
export async function GET(request: NextRequest) {
    console.log("=== RUNNING: /api/student/semester-schedule/route.ts ===");
    try {
        const { searchParams } = new URL(request.url);
        const semesterIdParam = searchParams.get("semesterId");
        const currentStudentId = 1; // Giả lập

        if (!currentStudentId) {
            return NextResponse.json({ code: 'UNAUTHORIZED', message: "Không tìm thấy thông tin sinh viên đang đăng nhập." }, { status: 401 });
        }

        let actualSemesterId: number | null = semesterIdParam ? parseInt(semesterIdParam) : null;
        if (semesterIdParam && isNaN(actualSemesterId!)) {
            return NextResponse.json({ code: 'UNPROCESSABLE_ENTITY', message: "ID học kỳ không hợp lệ." }, { status: 422 });
        }

        // Tự động tìm học kỳ nếu không có ID
        if (actualSemesterId === null) {
            const now = new Date();
            const semester = await prisma.hoc_ky.findFirst({
                where: { OR: [{ AND: [{ ngay_bat_dau: { lte: now } }, { ngay_ket_thuc: { gte: now } }] }, { ngay_xoa: null }] },
                orderBy: { ngay_ket_thuc: 'desc' },
                select: { id_hoc_ky: true },
            });
            if (semester) {
                actualSemesterId = semester.id_hoc_ky;
            } else {
                return NextResponse.json({ code: 'NOT_FOUND', message: "Chưa có học kỳ nào trong hệ thống." }, { status: 404 });
            }
        }

        // Truy vấn dữ liệu TKB
        const registeredCourses = await prisma.sinh_vien_khoa_hoc.findMany({
            where: {
                id_sinh_vien: currentStudentId,
                ngay_xoa: null,
                khoa_hoc: { id_hoc_ky: actualSemesterId, ngay_xoa: null },
            },
            // Tối ưu: Chỉ select những trường thật sự cần thiết
            select: {
                khoa_hoc: {
                    select: {
                        id_khoa_hoc: true,
                        mon_hoc: { select: { ma_mon_hoc: true, ten_mon_hoc: true, so_tin_chi: true } },
                        lop: { select: { ten_lop: true } },
                        giang_vien: { select: { nguoi: { select: { ho_ten: true } } } },
                        lich_hoc: {
                            where: { ngay_xoa: null },
                            select: {
                                id_lich_hoc: true, tiet_bat_dau: true, tiet_ket_thuc: true,
                                ngay: { select: { thu_tu_ngay: true } },
                                phong: { select: { ma_phong: true, ten_phong: true } },
                            },
                        },
                        hoc_ky: { select: { ngay_bat_dau: true, ngay_ket_thuc: true } } // Lấy trực tiếp từ khóa học
                    },
                },
            },
        });

        if (registeredCourses.length === 0) {
            return NextResponse.json({ code: 'EMPTY_DATA', message: "Chưa có thời khóa biểu cho học kỳ này.", data: [] }, { status: 200 });
        }

        // Tối ưu: Dùng `flatMap` để thay thế 2 vòng `forEach` lồng nhau.
        // `flatMap` sẽ lặp qua mỗi `registeredCourse`, sau đó lặp qua `lich_hoc` bên trong,
        // và tự động "làm phẳng" kết quả thành một mảng duy nhất.
        const timetable = registeredCourses.flatMap(rc => 
            rc.khoa_hoc?.lich_hoc.map(lh => {
                const khoaHoc = rc.khoa_hoc;
                if (!khoaHoc || !lh.ngay || !lh.phong) return null; // Bỏ qua nếu thiếu dữ liệu

                return {
                    id_lich_hoc: lh.id_lich_hoc,
                    ma_mon_hoc: khoaHoc.mon_hoc.ma_mon_hoc,
                    ten_mon_hoc: khoaHoc.mon_hoc.ten_mon_hoc,
                    so_tin_chi: khoaHoc.mon_hoc.so_tin_chi,
                    lop_hoc_phan: khoaHoc.lop?.ten_lop || 'N/A',
                    thu: lh.ngay.thu_tu_ngay,
                    tiet_bat_dau: lh.tiet_bat_dau,
                    tiet_ket_thuc: lh.tiet_ket_thuc,
                    so_tiet: (lh.tiet_ket_thuc - lh.tiet_bat_dau + 1),
                    phong: lh.phong.ma_phong,
                    ten_phong: lh.phong.ten_phong,
                    giang_vien: khoaHoc.giang_vien?.nguoi?.ho_ten || "Chưa có GV",
                    thoi_gian_hoc_chi_tiet_tiet: getTimeRangeForPeriods(lh.tiet_bat_dau, lh.tiet_ket_thuc),
                    thoi_gian_hoc_ngay: `${formatDate(khoaHoc.hoc_ky.ngay_bat_dau)} đến ${formatDate(khoaHoc.hoc_ky.ngay_ket_thuc)}`,
                    ghi_chu: null,
                };
            }).filter(Boolean) // Lọc bỏ các giá trị null
        );
        
        timetable.sort((a, b) => a.thu! - b.thu! || a.tiet_bat_dau! - b.tiet_bat_dau!);

        return NextResponse.json({ code: 'SUCCESS', message: 'Lấy dữ liệu thành công.', data: timetable }, { status: 200 });

    } catch (error) {
        console.error("Lỗi khi lấy TKB cá nhân:", error);
        return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: "Lỗi máy chủ nội bộ." }, { status: 500 });
    }
}