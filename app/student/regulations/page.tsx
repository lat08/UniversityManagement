"use client"

import { useState } from "react"
import { Download, ExternalLink, AlertTriangle, ChevronRight } from "lucide-react"

type Regulation = {
  id: string
  title: string
  description: string
  fileName?: string
  fileUrl?: string
}

const REGULATIONS: Regulation[] = [
  {
    id: "reg-1",
    title: "Quy chế đào tạo trình độ đại học",
    description:
      "Quy chế này quy định về tổ chức và quản lý đào tạo trình độ đại học tại Đại học Quốc tế Sài Gòn, bao gồm các quy định về chương trình đào tạo, tổ chức giảng dạy, học tập, thi và đánh giá kết quả học tập, điều kiện tốt nghiệp.",
    fileName: "QC_DaoTao_DaiHoc_2024.pdf",
    fileUrl: "#",
  },
  {
    id: "reg-2",
    title: "Quy chế tuyển sinh và đào tạo trình độ thạc sĩ",
    description:
      "Quy định chi tiết về tuyển sinh và đào tạo sau đại học, hồ sơ, điều kiện và nhiệm vụ học tập cho học viên cao học.",
    fileName: "QC_ThacSi_2024.pdf",
    fileUrl: "#",
  },
  {
    id: "reg-3",
    title: "Quy định về học phí và chính sách miễn giảm",
    description:
      "Quy định mức thu học phí, các chính sách miễn, giảm học phí dành cho các đối tượng chính sách, sinh viên có hoàn cảnh đặc biệt.",
    fileName: "QC_HocPhi_2024.pdf",
    fileUrl: "#",
  },
  {
    id: "reg-4",
    title: "Quy định về sử dụng cơ sở vật chất",
    description:
      "Hướng dẫn sử dụng phòng học, thư viện, phòng thí nghiệm và trang thiết bị chung cho cán bộ và sinh viên.",
    fileName: "QC_CSVC_2024.pdf",
    fileUrl: "#",
  },
]

export default function RegulationsPage() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selected = REGULATIONS[selectedIdx]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Quy chế Quy định</h1>
          <p className="text-base text-gray-600">Tìm hiểu các quy định, quy chế và chính sách của trường</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section - DANH SÁCH */}
          <aside className="w-full lg:w-[380px] flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-base font-semibold text-gray-900">DANH SÁCH</h3>
              </div>

              <nav className="p-4 space-y-2">
                {REGULATIONS.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedIdx(i)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 text-base
                      ${
                        i === selectedIdx
                          ? "bg-gray-100 border border-gray-300 text-gray-900 font-medium"
                          : "text-gray-700 hover:bg-gray-50 border border-transparent"
                      }
                    `}
                  >
                    {r.title}
                  </button>
                ))}
              </nav>

              {/* <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Chọn một mục để xem nội dung chi tiết. Tài liệu có thể được tải xuống hoặc xem trực tuyến.
                </p>
              </div> */}
            </div>
          </aside>

          <div className="hidden lg:block w-px bg-gray-200 self-stretch" />

          {/* Right Section - NỘI DUNG QUY CHẾ */}
          <article className="flex-1 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">NỘI DUNG QUY CHẾ</h2>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <p className="text-base text-gray-600 leading-relaxed">{selected.description}</p>
                </div>

                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-4">Tải xuống tài liệu đầy đủ:</h4>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={selected.fileUrl ?? "#"}
                      className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
                      download={selected.fileName}
                    >
                      <Download className="w-5 h-5" />
                      Tải file PDF
                    </a>

                    <a
                      href={selected.fileUrl ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 px-6 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Xem trực tuyến
                    </a>
                  </div>

                  {selected.fileName && (
                    <p className="mt-3 text-sm text-gray-500">{`Tên file: ${selected.fileName}`}</p>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-base text-yellow-900 mb-1">Lưu ý quan trọng</p>
                    <p className="text-base text-yellow-800 leading-relaxed">
                      Sinh viên có trách nhiệm đọc kỹ và tuân thủ các quy định trong quy chế này. Mọi thắc mắc xin liên
                      hệ Phòng Đào tạo hoặc Phòng Công tác sinh viên để được hướng dẫn chi tiết.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-base font-semibold text-gray-900">THÔNG TIN LIÊN HỆ</h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <p className="font-semibold text-base text-gray-900 mb-3">Phòng Đào tạo</p>
                    <p className="text-base text-gray-600 mb-1">Email: daotao@siu.edu.vn</p>
                    <p className="text-base text-gray-600">ĐT: (028) 3724 4270</p>
                  </div>
                  <div>
                    <p className="font-semibold text-base text-gray-900 mb-3">Phòng Công tác sinh viên</p>
                    <p className="text-base text-gray-600 mb-1">Email: ctsv@siu.edu.vn</p>
                    <p className="text-base text-gray-600">ĐT: (028) 3724 4271</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
