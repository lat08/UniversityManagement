// app/api/student/semester-schedule/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

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

// === HÀM HỖ TRỢ CHUYỂN ĐỔI TIẾT HỌC SANG KHUNG GIỜ ===
// Hàm này cần được điều chỉnh chính xác theo quy định giờ học của trường bạn.
// Ví dụ: Tiết 1 bắt đầu 07:00, tiết 5 kết thúc 11:10 (cho khối 1-5)
// === HÀM HỖ TRỢ CHUYỂN ĐỔI TIẾT HỌC SANG KHUNG GIỜ ===
// Hàm này được cập nhật dựa trên ảnh thời khóa biểu bạn cung cấp và thông tin "bắt đầu từ 7h15".
const getTimeRangeForPeriods = (startPeriod: number, endPeriod: number): string => {
  // Bản đồ thời gian BẮT ĐẦU của các tiết học dựa trên ảnh và yêu cầu
  const periodStartTimes: { [key: number]: string } = {
    1: "07:15", // Bắt đầu từ 7h15 theo yêu cầu của bạn
    2: "08:05",
    3: "09:10",
    4: "10:00",
    5: "10:50",
    6: "13:30",
    7: "14:20",
    8: "15:20",
    9: "16:10",
    10: "17:30",
    11: "18:20",
    12: "19:20",
    13: "20:10",
  };

  // Bản đồ thời gian KẾT THÚC của các tiết học.
  // Được xác định bằng thời gian bắt đầu của tiết tiếp theo,
  // hoặc giả định 50 phút (theo BA "Mỗi tiết học mặc định = 50 phút") nếu là tiết cuối cùng của một khối hoặc không có tiết liền kề.
  const periodEndTimes: { [key: number]: string } = {
    1: "08:05", // Kết thúc tiết 1 là bắt đầu tiết 2
    2: "09:10", // Kết thúc tiết 2 là bắt đầu tiết 3
    3: "10:00", // Kết thúc tiết 3 là bắt đầu tiết 4
    4: "10:50", // Kết thúc tiết 4 là bắt đầu tiết 5
    5: "11:40", // Tiết 5 (bắt đầu 10:50) + 50 phút = 11:40 (trước khi nghỉ trưa dài)
    6: "14:20", // Kết thúc tiết 6 là bắt đầu tiết 7
    7: "15:20", // Kết thúc tiết 7 là bắt đầu tiết 8
    8: "16:10", // Kết thúc tiết 8 là bắt đầu tiết 9
    9: "17:00", // Tiết 9 (bắt đầu 16:10) + 50 phút = 17:00 (trước khi nghỉ chiều)
    10: "18:20",// Kết thúc tiết 10 là bắt đầu tiết 11
    11: "19:20",// Kết thúc tiết 11 là bắt đầu tiết 12
    12: "20:10",// Kết thúc tiết 12 là bắt đầu tiết 13
    13: "21:00",// Tiết 13 (bắt đầu 20:10) + 50 phút = 21:00 (giả định)
  };

  const startTime = periodStartTimes[startPeriod];
  const endTime = periodEndTimes[endPeriod]; // Lấy thời gian kết thúc của tiết cuối cùng trong block

  if (startTime && endTime) {
    return `${startTime} – ${endTime}`;
  }
  return "Không xác định"; // Trả về giá trị mặc định nếu không tìm thấy khung giờ
};


export async function GET(request: NextRequest) {
    console.log("=== ĐANG CHẠY: /api/student/semesters-schedule/route.ts ==="); // Thêm dòng này
  const { searchParams } = new URL(request.url);
  const semesterIdParam = searchParams.get("semesterId");

  // Trong ứng dụng thực tế, id_sinh_vien sẽ được lấy từ session hoặc token xác thực của người dùng đang đăng nhập.
  // Ví dụ này giả định một ID sinh viên cố định hoặc bạn sẽ thay thế nó bằng logic lấy từ session.
  const currentStudentId = 1; // THAY THẾ bằng ID sinh viên thực tế (từ phiên đăng nhập)

  if (!currentStudentId) {
    return NextResponse.json(
      { message: "Không tìm thấy thông tin sinh viên đang đăng nhập." },
      { status: 401 }
    );
  }

  let actualSemesterId: number | null = null;
  if (semesterIdParam) {
    actualSemesterId = parseInt(semesterIdParam);
    if (isNaN(actualSemesterId)) {
      return NextResponse.json({ message: "ID học kỳ không hợp lệ." }, { status: 400 });
    }
  }

  try {
    // Nếu không có semesterId được cung cấp, tìm học kỳ hiện tại hoặc học kỳ gần nhất
    if (actualSemesterId === null) {
      const currentSemester = await prisma.hoc_ky.findFirst({
        where: {
          ngay_bat_dau: { lte: new Date() }, // lte = less than or equal to
          ngay_ket_thuc: { gte: new Date() }, // gte = greater than or equal to
          ngay_xoa: null,
        },
        orderBy: {
          ngay_bat_dau: 'desc',
        },
        select: { id_hoc_ky: true },
      });

      if (currentSemester) {
        actualSemesterId = currentSemester.id_hoc_ky;
      } else {
        // Nếu không có học kỳ hiện tại, lấy học kỳ gần nhất (có ngày kết thúc gần nhất)
        const latestSemester = await prisma.hoc_ky.findFirst({
          where: {
            ngay_xoa: null,
          },
          orderBy: {
            ngay_ket_thuc: 'desc',
          },
          select: { id_hoc_ky: true },
        });
        if (latestSemester) {
          actualSemesterId = latestSemester.id_hoc_ky;
        } else {
          return NextResponse.json({ message: "Chưa có học kỳ nào trong hệ thống để hiển thị." }, { status: 404 });
        }
      }
    }

    // Query lấy thời khóa biểu của sinh viên bằng Prisma
    const timetableRawData = await prisma.sinh_vien_khoa_hoc.findMany({
      where: {
        id_sinh_vien: currentStudentId,
        ngay_xoa: null,
        khoa_hoc: {
          id_hoc_ky: actualSemesterId,
          ngay_xoa: null,
          mon_hoc: {
            ngay_xoa: null,
          },
        },
      },
      select: {
        khoa_hoc: {
          select: {
            id_khoa_hoc: true,
            mon_hoc: {
              select: {
                ma_mon_hoc: true,
                ten_mon_hoc: true,
                so_tin_chi: true,
              },
            },
            lop: { // Đây là `lop` (class) mà khóa học được phân vào, dùng cho `lop_hoc_phan`
              select: {
                ten_lop: true,
              },
            },
            giang_vien: {
              select: {
                nguoi: {
                  select: {
                    ho_ten: true,
                  },
                },
              },
            },
            // Include lịch học, mỗi khóa học có thể có nhiều lịch (lý thuyết, thực hành)
            lich_hoc: {
              where: {
                ngay_xoa: null,
              },
              select: {
                id_lich_hoc: true,
                tiet_bat_dau: true,
                tiet_ket_thuc: true,
                ngay: {
                  select: {
                    thu_tu_ngay: true,
                    tuan: {
                      select: {
                        hoc_ky: {
                          select: {
                            ngay_bat_dau: true,
                            ngay_ket_thuc: true,
                          },
                        },
                      },
                    },
                  },
                },
                phong: {
                  select: {
                    ma_phong: true,
                    ten_phong: true,
                  },
                },
              },
              orderBy: [ // Sắp xếp lịch học để khi map ra cũng theo thứ tự
                { ngay: { thu_tu_ngay: 'asc' } },
                { tiet_bat_dau: 'asc' },
              ]
            },
          },
        },
      },
    });

    if (timetableRawData.length === 0) {
      return NextResponse.json({ message: "Chưa có thời khóa biểu cho học kỳ này." }, { status: 404 });
    }

    // Xử lý dữ liệu để phù hợp với schema StudentTimetableItem
    const timetable: any[] = [];

    timetableRawData.forEach(svkh => {
      const khoaHoc = svkh.khoa_hoc;
      if (!khoaHoc) return; // Should not happen with current WHERE clause, but good for type safety

      khoaHoc.lich_hoc.forEach(lh => {
        const monHoc = khoaHoc.mon_hoc;
        const lopHocPhan = khoaHoc.lop;
        const giangVienNguoi = khoaHoc.giang_vien?.nguoi;
        const ngay = lh.ngay;
        const phong = lh.phong;
        const hocKy = ngay?.tuan?.hoc_ky;

        if (!monHoc || !lh || !ngay || !phong || !hocKy) return; // Chỉ lấy các mục có đủ thông tin lịch

        // Tính toán so_tiet
        const so_tiet = (lh.tiet_ket_thuc && lh.tiet_bat_dau) ? (lh.tiet_ket_thuc - lh.tiet_bat_dau + 1) : 0;

        // Định dạng tên giảng viên: Họ viết tắt + Tên (VD: N.H.Đức)
        let giangVienFormatted = "Chưa có giảng viên";
        if (giangVienNguoi?.ho_ten) {
          const parts = giangVienNguoi.ho_ten.split(' ').filter(Boolean);
          if (parts.length > 1) {
            const lastName = parts[parts.length - 1];
            const firstNamesInitials = parts.slice(0, -1).map(p => p[0]).join('.');
            giangVienFormatted = `${firstNamesInitials}.${lastName}`;
          } else {
            giangVienFormatted = giangVienNguoi.ho_ten;
          }
        }

        // Định dạng ngày: dd/MM/yy đến dd/MM/yy
        const formatDate = (date: Date | null) => {
          if (!date) return '';
          return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
        };
        const thoiGianHocNgay = (hocKy.ngay_bat_dau && hocKy.ngay_ket_thuc) ?
          `${formatDate(hocKy.ngay_bat_dau)} đến ${formatDate(hocKy.ngay_ket_thuc)}` : 'N/A';

        timetable.push({
          id_lich_hoc: lh.id_lich_hoc,
          ma_mon_hoc: monHoc.ma_mon_hoc,
          ten_mon_hoc: monHoc.ten_mon_hoc,
          so_tin_chi: monHoc.so_tin_chi,
          lop_hoc_phan: lopHocPhan?.ten_lop || 'N/A', // Sử dụng ten_lop từ bảng lop
          thu: ngay.thu_tu_ngay,
          tiet_bat_dau: lh.tiet_bat_dau,
          tiet_ket_thuc: lh.tiet_ket_thuc,
          so_tiet: so_tiet,
          phong: phong.ma_phong,
          ten_phong: phong.ten_phong,
          giang_vien: giangVienFormatted,
          thoi_gian_hoc_chi_tiet_tiet: getTimeRangeForPeriods(lh.tiet_bat_dau, lh.tiet_ket_thuc),
          thoi_gian_hoc_ngay: thoiGianHocNgay,
          ghi_chu: null, // Trường ghi_chu hiện không có trong DB schema, bạn có thể thêm sau nếu cần
        });
      });
    });

    if (timetable.length === 0) {
        return NextResponse.json({ message: "Chưa có thời khóa biểu cho học kỳ này." }, { status: 404 });
    }

    // Sắp xếp lại timetable nếu cần, vì `findMany` và `forEach` không đảm bảo thứ tự cuối cùng
    timetable.sort((a, b) => {
        if (a.thu !== b.thu) {
            return a.thu - b.thu;
        }
        return a.tiet_bat_dau - b.tiet_bat_dau;
    });

    return NextResponse.json(timetable);

  } catch (error) {
    console.error("Lỗi khi lấy thời khóa biểu của sinh viên:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ khi lấy thời khóa biểu." },
      { status: 500 }
    );
  }
}