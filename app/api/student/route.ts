import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/db/prisma';

// Lấy danh sách sinh viên
export async function GET(req: NextRequest) {
  try {
    const students = await prisma.sinh_vien.findMany({
      include: {
        nguoi: true,
        lop: true,
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Không thể lấy dữ liệu sinh viên' }, { status: 500 });
  }
}

// Thêm sinh viên mới
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Tạo bản ghi người trước
    const nguoi = await prisma.nguoi.create({
      data: {
        ho_ten: data.ho_ten,
        ngay_sinh: data.ngay_sinh,
        gioi_tinh: data.gioi_tinh,
        email: data.email,
        so_dien_thoai: data.so_dien_thoai,
        dia_chi: data.dia_chi,
      },
    });

    // Tạo bản ghi sinh viên
    const sinh_vien = await prisma.sinh_vien.create({
      data: {
        id_nguoi: nguoi.id_nguoi,
        ma_sinh_vien: data.ma_sinh_vien,
        id_lop: data.id_lop,
      },
    });
    return NextResponse.json(sinh_vien);
  } catch (error) {
    return NextResponse.json({ error: 'Không thể thêm sinh viên' }, { status: 500 });
  }
}

// Cập nhật thông tin sinh viên
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    // Cập nhật bản ghi người 
    await prisma.nguoi.update({
      where: { id_nguoi: data.id_nguoi },
      data: {
        ho_ten: data.ho_ten,
        ngay_sinh: data.ngay_sinh,
        gioi_tinh: data.gioi_tinh,
        email: data.email,
        so_dien_thoai: data.so_dien_thoai,
        dia_chi: data.dia_chi,
      },
    });

    // Cập nhật bản ghi sinh viên
    const sinh_vien = await prisma.sinh_vien.update({
      where: { id_sinh_vien: data.id_sinh_vien },
      data: {
        ma_sinh_vien: data.ma_sinh_vien,
        id_lop: data.id_lop,
      },
    });
    return NextResponse.json(sinh_vien);
  } catch (error) {
    console.error('PUT sinh_vien error:', error);
    return NextResponse.json({ error: 'Không thể cập nhật sinh viên' }, { status: 500 });
  }
}

// Xóa sinh viên
export async function DELETE(req: NextRequest) {
  try {
    const { id_sinh_vien } = await req.json();

    // Lấy id_nguoi từ sinh_vien
    const sinh_vien = await prisma.sinh_vien.findUnique({
      where: { id_sinh_vien },
      select: { id_nguoi: true },
    });

    if(!sinh_vien) {
      return NextResponse.json({ error: 'Sinh viên không tồn tại' }, { status: 404 });
    }

    // Xóa sinh viên
    await prisma.sinh_vien.delete({
      where: { id_sinh_vien },
    });

    // Xóa người
    await prisma.nguoi.delete({
      where: { id_nguoi: sinh_vien.id_nguoi },
    });
    return NextResponse.json({ message: 'Xóa sinh viên thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể xóa sinh viên' }, { status: 500 });
  }
}