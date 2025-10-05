import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/db/prisma';

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