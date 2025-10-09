import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

function getWeekRange(date = new Date())  {
  const start = new Date(date);
  const end = new Date(date);
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(date.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function GET(req: NextRequest) {
  try{
    const { searchParams } = new URL(req.url);
    const id_sinh_vien = Number(searchParams.get("id_sinh_vien"));
    const id_hoc_ky = Number(searchParams.get("id_hoc_ky"));


    if(!id_sinh_vien) {
      return NextResponse.json({ message: "Thiếu id_sinh_vien!" }, { status: 400 });
    }

    const { start, end } = getWeekRange();

    // 1. Số buổi học trong tuần
    const lichHocTrongTuan = await prisma.lich_hoc.count({
      where: {
        khoa_hoc: {
          sinh_vien_khoa_hoc: {
            some: { id_sinh_vien ,}
          },
        },
        ngay: {
          ngay_thang: {
            gte: start,
            lte: end,
          },
        },
      },
    });

    // 2. Số môn thi trong tuần
    const lichThiTrongTuan = await prisma.lich_thi.count({
      where: {
        khoa_hoc: {
          sinh_vien_khoa_hoc: {
            some: { id_sinh_vien ,},
          },
        },
        ngay: {
          ngay_thang: {
            gte: start,
            lte: end,
          },
        },
      },
    });

    // 3. Thống kê học tập
    const ketQua = await prisma.sinh_vien_khoa_hoc.findMany({
      where: { id_sinh_vien },
      include: {
        khoa_hoc: {
          include: {
            mon_hoc: {
              select: { so_tin_chi: true},
            },
          },
        },
      },
    });

    let thongKe;
    if(ketQua.length === 0) {
      thongKe = {
        diem_tb_tich_luy: 0,
        so_tin_chi_dat: 0,
        xep_loai: "Chưa có dữ liệu",
      };
    } else {
      let tongTinChi = 0;
      let tongDiemTinChi = 0;

      ketQua.forEach((kq) => {
        const tongKet = 
          (Number(kq.diem_chuyen_can || 0) * 0.2 +
            Number(kq.diem_giua_ky || 0) * 0.3 +
            Number(kq.diem_cuoi_ky || 0) * 0.5);
        const tinChi = kq.khoa_hoc.mon_hoc.so_tin_chi || 0;

        tongTinChi += tinChi;
        tongDiemTinChi += tongKet * tinChi;
      });

      const diemTB = tongTinChi ? tongDiemTinChi / tongTinChi : 0;

      let xepLoai = "Yếu";
      if(diemTB >= 8.5) xepLoai = "Giỏi";
      else if(diemTB >= 7.0) xepLoai = "Khá";
      else if(diemTB >= 5.0) xepLoai = "Trung bình";

      thongKe = {
        diem_tb_tich_luy: parseFloat(diemTB.toFixed(2)),
        so_tin_chi_dat: tongTinChi,
        xep_loai: xepLoai,
      };
    }

    // 4. Thông tin sinh viên
    const sinhVien = await prisma.sinh_vien.findUnique({
      where: { id_sinh_vien },
      include: {
        nguoi: true,
        lop: {
          include: {
            nam_hoc_lop_id_nam_hoc_bat_dauTonam_hoc: true,
            nam_hoc_lop_id_nam_hoc_ket_thucTonam_hoc: true,
          },
        },
      },
    });

    // 5. Lấy học kỳ hiện tại
    let chonHocKy = id_hoc_ky;

    if(!chonHocKy) {
      const hockyHienTai = await prisma.hoc_ky.findFirst({
        where: {
          ngay_bat_dau: { lte: new Date() },
          ngay_ket_thuc: { gte: new Date() },
        }
      });
      chonHocKy = hockyHienTai?.id_hoc_ky;
    }

    // Lấy kết quả học tập
    const ketQuaHocTap = await prisma.sinh_vien_khoa_hoc.findMany({
      where: { 
        id_sinh_vien,
        khoa_hoc: {
          id_hoc_ky: chonHocKy,
        },
      },
      include: {
        khoa_hoc: {
          include: {
            mon_hoc: true,
            giang_vien: {
              include: { nguoi: true },
            },
          },
        },
      },
    });

    // Tính từng điểm tổng kết cho từng môn để vẽ biểu đồ
    const ketQuaHocTapChiTiet = ketQuaHocTap.map((kq) => {
      const diem_chuyen_can = Number(kq.diem_chuyen_can || 0);
      const diem_giua_ky = Number(kq.diem_giua_ky || 0);
      const diem_cuoi_ky = Number(kq.diem_cuoi_ky || 0);

      const diemTongKet = diem_chuyen_can * 0.2 + diem_giua_ky * 0.3 + diem_cuoi_ky * 0.5;

      const datHP = diemTongKet >= 5.0 ? "Đạt" : "Không đạt";

      return {
        maMonHoc: kq.khoa_hoc.mon_hoc.ma_mon_hoc,
        tenMonHoc: kq.khoa_hoc.mon_hoc.ten_mon_hoc,
        soTinChi: kq.khoa_hoc.mon_hoc.so_tin_chi,
        datHP,
      }
    });

    // 6.Thông báo mới nhất cho sinh viên
    const thongBao = await prisma.thong_bao.findMany({
      where: {
        nguoi_dung_thong_bao_id_nguoi_nhanTonguoi_dung: {
          id_nguoi: (
            await prisma.sinh_vien.findUnique({
              where: { id_sinh_vien },
              select: { id_nguoi: true },
            })
          )?.id_nguoi,
        },
      },
      orderBy: { ngay_tao: "desc" },
      take: 5,
    });
    
    // 7. Các lớp (khóa học) sinh viên đang học
    const lopDangHoc = await prisma.khoa_hoc.findMany({
      where: {
        sinh_vien_khoa_hoc: {
          some: { id_sinh_vien },
        },
        trang_thai: "active",
      },
      include: {
        mon_hoc: true,
        giang_vien: { include: { nguoi: true } },
        lich_hoc: {
          include: {
            phong: true,
            ngay: true,
          },
        },
      },
    });

    // 8. Trả về kết quả tổng hợp
    return NextResponse.json({
      sinhVien,
      thongKe,
      lichHocTrongTuan,
      lichThiTrongTuan,
      ketQuaHocTapChiTiet,
      thongBao,
      lopDangHoc,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Lỗi máy chủ!" }, { status: 500 });
  }
}