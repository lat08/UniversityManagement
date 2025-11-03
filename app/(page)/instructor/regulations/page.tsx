"use client"

import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { RegulationsPage } from "@/app/components/regulations"

export default function InstructorRegulationsPage() {
  usePageTitle('Quy chế / Quy định')

  return (
    <RegulationsPage
      pageTitle="Quy chế - Quy định"
      description="Tìm hiểu các quy định, quy chế và chính sách dành cho giảng viên"
      noticeText="Giảng viên có trách nhiệm đọc kỹ và tuân thủ các quy định trong quy chế này. Mọi thắc mắc xin liên hệ Phòng Đào tạo hoặc Phòng Tổ chức - Nhân sự để được hướng dẫn chi tiết."
    />
  )
}
