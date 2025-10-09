import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id_sinh_vien = Number(searchParams.get('id_sinh_vien'))
    const id_hoc_ky = Number(searchParams.get('id_hoc_ky'))
    let id_tuan = Number(searchParams.get('id_tuan'))

    if (!id_sinh_vien || !id_hoc_ky) {
      return NextResponse.json({ error: 'Thiếu tham số cần thiết' }, { status: 400 })
    }

    if (!id_tuan) {
      const tuanDauTien = await prisma.tuan.findFirst({
        where: { hoc_ky: { id_hoc_ky } },
        orderBy: { id_tuan: 'asc' },
      })
      if (!tuanDauTien) {
        return NextResponse.json({ error: 'Không tìm thấy tuần trong học kỳ này' }, { status: 404 })
      }
      id_tuan = tuanDauTien.id_tuan
    }

    // 1️⃣ Lấy danh sách khóa học mà sinh viên đã đăng ký trong học kỳ
    const dsKhoaHoc = await prisma.sinh_vien_khoa_hoc.findMany({
      where: {
        id_sinh_vien,
        khoa_hoc: { id_hoc_ky } 
      },
      include: {
        khoa_hoc: {
          include: {
            mon_hoc: true,
            giang_vien: {
              include: { nguoi: true }
            },
            lich_hoc: {
              where: {
                ngay: { id_tuan }
              },
              include: {
                phong: true,
                ngay: {
                  include: { tuan: true }
                }
              }
            }
          }
        }
      }
    })

    // 2️⃣ Chuyển dữ liệu sang định dạng frontend dễ đọc
    const thoiKhoaBieu = dsKhoaHoc.flatMap(kh => 
      kh.khoa_hoc.lich_hoc.map(lich => ({
        thu: lich.ngay.ten_ngay,
        ngay: lich.ngay.ngay_thang,
        tiet_bat_dau: lich.tiet_bat_dau,
        tiet_ket_thuc: lich.tiet_ket_thuc,
        ten_mon_hoc: kh.khoa_hoc.mon_hoc.ten_mon_hoc,
        ma_mon_hoc: kh.khoa_hoc.mon_hoc.ma_mon_hoc,
        giang_vien: kh.khoa_hoc.giang_vien.nguoi.ho_ten,
        phong: lich.phong.ten_phong,
      }))
    )

    return NextResponse.json({ 
        id_sinh_vien, 
        id_hoc_ky, 
        id_tuan, 
        thoi_khoa_bieu: thoiKhoaBieu })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
