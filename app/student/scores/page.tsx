"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Header } from "@/app/components/header/header";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { 
  Printer, 
  TrendingUp, 
  BookOpen, 
  Award,
  ChevronDown,
  CheckCircle,
  XCircle,
  ChevronUp,
  List,
  X
} from "lucide-react";
import { useState } from "react";

export default function ScoresPage() {
  const handleMobileMenuToggle = () => {
    // Handle mobile menu toggle
  };

  // Mock data - thay thế bằng data thực từ API
  const scoreOverview = {
    gpa: 2.67,
    totalCredits: 56,
    maxCredits: 120,
    completedCourses: 18
  };

  const semesterData = [
    {
      semester: "Học kỳ 3 - Năm học 2023 - 2024",
      courses: [
        {
          stt: 1,
          code: "2ENG21325",
          group: "TA22H3",
          name: "SPEAKING 3 (1)",
          credits: 1,
          examScore: 5.5,
          score10: 7.0,
          score4: 3.0,
          letterGrade: "B",
          status: "Đạt"
        },
        {
          stt: 2,
          code: "2ENG21326",
          group: "TA23H3",
          name: "LISTENING 3 (1)",
          credits: 1,
          examScore: 4.4,
          score10: 6.2,
          score4: 2.0,
          letterGrade: "C",
          status: "Đạt"
        },
        {
          stt: 3,
          code: "2ENG21327",
          group: "TA24H3",
          name: "ENGLISH SKILLS 3 (1)",
          credits: 1,
          examScore: 3.6,
          score10: 5.1,
          score4: 1.0,
          letterGrade: "D",
          status: "Đạt"
        },
        {
          stt: 4,
          code: "2GEN0001",
          group: "TV26",
          name: "GIÁO DỤC QUỐC PHÒNG (11)",
          credits: 11,
          examScore: null,
          score10: null,
          score4: null,
          letterGrade: null,
          status: "Không đạt"
        },
        {
          stt: 5,
          code: "2GEN0002",
          group: "TV27",
          name: "AN NINH MẠNG (3)",
          credits: 3,
          examScore: 7.5,
          score10: 8.6,
          score4: 4.0,
          letterGrade: "A",
          status: "Đạt"
        },
        {
          stt: 6,
          code: "2GEN0003",
          group: "TV28",
          name: "BƠI LỘI (1)",
          credits: 1,
          examScore: 9.0,
          score10: 8.6,
          score4: 4.0,
          letterGrade: "A",
          status: "Đạt"
        }
      ],
      summary: {
        semesterAvg4: 4.00,
        semesterAvg10: 8.54,
        semesterCredits: 5,
        cumulativeAvg4: 2.67,
        cumulativeAvg10: 7.21,
        cumulativeCredits: 36,
        classification: "Xuất sắc"
      }
    },
    {
      semester: "Học kỳ 2 - Năm học 2023 - 2024",
      courses: [
        {
          stt: 1,
          code: "2ENG21321",
          group: "TA79H2",
          name: "SPEAKING 2 (1)",
          credits: 1,
          examScore: 6.8,
          score10: 7.3,
          score4: 3.0,
          letterGrade: "B",
          status: "Đạt"
        },
        {
          stt: 2,
          code: "2ENG21322",
          group: "TA80H2",
          name: "LISTENING 2 (1)",
          credits: 1,
          examScore: 2.0,
          score10: 4.1,
          score4: 1.0,
          letterGrade: "D",
          status: "Đạt"
        },
        {
          stt: 3,
          code: "2ENG21323",
          group: "TA81H2",
          name: "ENGLISH SKILLS 2 (1)",
          credits: 1,
          examScore: 8.5,
          score10: 8.8,
          score4: 4.0,
          letterGrade: "A",
          status: "Đạt"
        },
        {
          stt: 4,
          code: "2CS0001",
          group: "TV82",
          name: "XÁC SUẤT VÀ THỐNG KÊ (3)",
          credits: 3,
          examScore: 6.0,
          score10: 6.5,
          score4: 2.0,
          letterGrade: "C",
          status: "Đạt"
        },
        {
          stt: 5,
          code: "2CS0002",
          group: "TV83",
          name: "CƠ SỞ DỮ LIỆU (3)",
          credits: 3,
          examScore: 7.2,
          score10: 7.8,
          score4: 3.0,
          letterGrade: "B",
          status: "Đạt"
        },
        {
          stt: 6,
          code: "2CS0003",
          group: "TV84",
          name: "KIẾN TRÚC MÁY TÍNH (2)",
          credits: 2,
          examScore: 8.0,
          score10: 8.2,
          score4: 4.0,
          letterGrade: "A",
          status: "Đạt"
        },
        {
          stt: 7,
          code: "2CS0004",
          group: "TV85",
          name: "CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT (3)",
          credits: 3,
          examScore: 5.5,
          score10: 6.0,
          score4: 2.0,
          letterGrade: "C",
          status: "Đạt"
        },
        {
          stt: 8,
          code: "2CS0005",
          group: "TV86",
          name: "LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (3)",
          credits: 3,
          examScore: 7.8,
          score10: 8.1,
          score4: 3.0,
          letterGrade: "B",
          status: "Đạt"
        },
        {
          stt: 9,
          code: "2GEN0006",
          group: "TV87",
          name: "TRIẾT HỌC MÁC - LÊNIN (3)",
          credits: 3,
          examScore: 6.5,
          score10: 7.0,
          score4: 3.0,
          letterGrade: "B",
          status: "Đạt"
        }
      ],
      summary: {
        semesterAvg4: 2.38,
        semesterAvg10: 7.11,
        semesterCredits: 16,
        cumulativeAvg4: 2.45,
        cumulativeAvg10: 6.99,
        cumulativeCredits: 31,
        classification: "Trung Bình"
      }
    },
    {
      semester: "Học kỳ 1 - Năm học 2023 - 2024",
      courses: [
        {
          stt: 1,
          code: "2BUS21440",
          group: "TV154",
          name: "XÁC SUẤT VÀ THỐNG KÊ (3)",
          credits: 3,
          examScore: null,
          score10: 3.0,
          score4: 6.1,
          letterGrade: "C",
          status: "Đạt"
        },
        {
          stt: 2,
          code: "2ENG1317",
          group: "TA156K1",
          name: "SPEAKING 1 (1)",
          credits: 1,
          examScore: null,
          score10: 5.2,
          score4: 7.2,
          letterGrade: "B",
          status: "Đạt"
        },
        {
          stt: 3,
          code: "2ENG1318",
          group: "TA157K1",
          name: "LISTENING 1 (1)",
          credits: 1,
          examScore: null,
          score10: 5.2,
          score4: 7.2,
          letterGrade: "B",
          status: "Đạt"
        },
        {
          stt: 4,
          code: "2LAN2101",
          group: "TV160",
          name: "ENGLISH SKILLS 1 (1)",
          credits: 1,
          examScore: null,
          score10: 6.8,
          score4: 8.2,
          letterGrade: "A",
          status: "Đạt"
        },
        {
          stt: 5,
          code: "CTS12125",
          group: "TV161",
          name: "KIẾN TRÚC MÁY TÍNH (2)",
          credits: 2,
          examScore: null,
          score10: 7.5,
          score4: 8.0,
          letterGrade: "A",
          status: "Đạt"
        },
        {
          stt: 6,
          code: "CTS12126",
          group: "TV162",
          name: "CƠ SỞ DỮ LIỆU (3)",
          credits: 3,
          examScore: null,
          score10: 6.5,
          score4: 7.8,
          letterGrade: "B",
          status: "Đạt"
        },
        {
          stt: 7,
          code: "CTS12127",
          group: "TV163",
          name: "LẬP TRÌNH CƠ BẢN (3)",
          credits: 3,
          examScore: null,
          score10: 7.2,
          score4: 8.1,
          letterGrade: "A",
          status: "Đạt"
        },
        {
          stt: 8,
          code: "CTS13125",
          group: "TV164",
          name: "CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT (3)",
          credits: 3,
          examScore: null,
          score10: 8.0,
          score4: 8.5,
          letterGrade: "A",
          status: "Đạt"
        },
        {
          stt: 9,
          code: "CTS13126",
          group: "TV165",
          name: "MẠNG MÁY TÍNH (3)",
          credits: 3,
          examScore: null,
          score10: 8.5,
          score4: 8.8,
          letterGrade: "A",
          status: "Đạt"
        },
        {
          stt: 10,
          code: "CTS13127",
          group: "TV166",
          name: "CƠ SỞ LẬP TRÌNH (4)",
          credits: 4,
          examScore: null,
          score10: 7.8,
          score4: 8.3,
          letterGrade: "A",
          status: "Đạt"
        }
      ],
      summary: {
        semesterAvg4: 2.53,
        semesterAvg10: 6.87,
        semesterCredits: 15,
        cumulativeAvg4: 2.53,
        cumulativeAvg10: 6.87,
        cumulativeCredits: 15,
        classification: "Khá"
      }
    }
  ];

  const [selectedSemester, setSelectedSemester] = useState("Tất cả học kỳ");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Chi tiết điểm của môn học
  const courseDetails: Record<string, {
    name: string;
    components: Array<{
      stt: number;
      name: string;
      weight: number;
      score: number;
    }>;
  }> = {
    "2CS0001": {
      name: "XÁC SUẤT VÀ THỐNG KÊ (3)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.5
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 9.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 3.0
        }
      ]
    },
    "2CS0002": {
      name: "CƠ SỞ DỮ LIỆU (3)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 7.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 7.2
        }
      ]
    },
    "2CS0003": {
      name: "KIẾN TRÚC MÁY TÍNH (2)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.5
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 8.0
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 8.0
        }
      ]
    },
    "2CS0004": {
      name: "CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT (3)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 7.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 6.0
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 5.5
        }
      ]
    },
    "2CS0005": {
      name: "LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (3)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 8.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 7.8
        }
      ]
    },
    "2ENG21325": {
      name: "SPEAKING 3 (1)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 7.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 5.5
        }
      ]
    },
    "2ENG21326": {
      name: "LISTENING 3 (1)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 7.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 6.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 4.4
        }
      ]
    },
    "2ENG21327": {
      name: "ENGLISH SKILLS 3 (1)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 6.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 5.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 3.6
        }
      ]
    },
    "2GEN0002": {
      name: "AN NINH MẠNG (3)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 9.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 8.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 7.5
        }
      ]
    },
    "2GEN0003": {
      name: "BƠI LỘI (1)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 9.5
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 9.0
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 9.0
        }
      ]
    },
    "2ENG21321": {
      name: "SPEAKING 2 (1)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 7.0
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 6.8
        }
      ]
    },
    "2ENG21322": {
      name: "LISTENING 2 (1)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 6.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 5.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 2.0
        }
      ]
    },
    "2ENG21323": {
      name: "ENGLISH SKILLS 2 (1)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 9.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 8.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 8.5
        }
      ]
    },
    "2GEN0006": {
      name: "TRIẾT HỌC MÁC - LÊNIN (3)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 7.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 6.5
        }
      ]
    },
    "2BUS21440": {
      name: "XÁC SUẤT VÀ THỐNG KÊ (3)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 7.5
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 7.0
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 6.1
        }
      ]
    },
    "2ENG1317": {
      name: "SPEAKING 1 (1)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 7.5
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 7.0
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 7.2
        }
      ]
    },
    "2ENG1318": {
      name: "LISTENING 1 (1)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 7.5
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 7.0
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 7.2
        }
      ]
    },
    "2LAN2101": {
      name: "ENGLISH SKILLS 1 (1)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.5
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 8.0
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 8.2
        }
      ]
    },
    "CTS12125": {
      name: "KIẾN TRÚC MÁY TÍNH (2)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.5
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 8.0
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 8.0
        }
      ]
    },
    "CTS12126": {
      name: "CƠ SỞ DỮ LIỆU (3)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 7.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 7.8
        }
      ]
    },
    "CTS12127": {
      name: "LẬP TRÌNH CƠ BẢN (3)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.5
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 8.0
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 8.1
        }
      ]
    },
    "CTS13125": {
      name: "CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT (3)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 9.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 8.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 8.5
        }
      ]
    },
    "CTS13126": {
      name: "MẠNG MÁY TÍNH (3)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 9.0
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 8.5
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 8.8
        }
      ]
    },
    "CTS13127": {
      name: "CƠ SỞ LẬP TRÌNH (4)",
      components: [
        {
          stt: 1,
          name: "Chuyên cần và Thái độ HT",
          weight: 20,
          score: 8.5
        },
        {
          stt: 2,
          name: "Kiểm tra",
          weight: 30,
          score: 8.0
        },
        {
          stt: 3,
          name: "Điểm thi",
          weight: 50,
          score: 8.3
        }
      ]
    }
  };

  const handleShowDetail = (courseCode: string) => {
    if (courseDetails[courseCode]) {
      setSelectedCourse(courseCode);
      setShowDetailModal(true);
    } else {
      // Hiển thị thông báo nếu không có dữ liệu chi tiết
      alert("Chưa có dữ liệu chi tiết cho môn học này.");
    }
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedCourse(null);
  };

  const getStatusIcon = (status: string) => {
    return status === "Đạt" ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Xuất sắc": return "text-purple-600 bg-purple-50";
      case "Giỏi": return "text-blue-600 bg-blue-50";
      case "Khá": return "text-green-600 bg-green-50";
      case "Trung Bình": return "text-yellow-600 bg-yellow-50";
      case "Yếu": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onMobileMenuToggle={handleMobileMenuToggle} />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Điểm số</h1>
          <p className="text-gray-500">Theo dõi kết quả học tập và tiến độ học tập</p>
        </div>

        {/* Tổng quan điểm số */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-black">Tổng quan điểm số</h2>
            <div className="flex items-center gap-2">
              <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Tất cả học kỳ">Tất cả học kỳ</option>
                <option value="Học kỳ 1 - Năm học 2023 - 2024">Học kỳ 1 - Năm học 2023 - 2024</option>
                <option value="Học kỳ 2 - Năm học 2023 - 2024">Học kỳ 2 - Năm học 2023 - 2024</option>
                <option value="Học kỳ 3 - Năm học 2023 - 2024">Học kỳ 3 - Năm học 2023 - 2024</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Điểm trung bình */}
            <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Điểm trung bình</p>
                    <p className="text-xs text-gray-500">GPA 4.0</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-black">{scoreOverview.gpa}</p>
              </CardContent>
            </Card>

            {/* Card 2: Tổng tín chỉ hoàn thành */}
            <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng tín chỉ hoàn thành</p>
                    <p className="text-xs text-gray-500">/ {scoreOverview.maxCredits} tín chỉ</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-black">{scoreOverview.totalCredits}</p>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(scoreOverview.totalCredits / scoreOverview.maxCredits) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Môn đã hoàn thành */}
            <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Môn đã hoàn thành</p>
                    <p className="text-xs text-gray-500">môn học</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-black">{scoreOverview.completedCourses}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bảng điểm chi tiết cho từng học kỳ */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-black">Bảng điểm chi tiết cho từng học kỳ</h2>
          
          {semesterData.map((semester, semesterIndex) => (
            <Card key={semesterIndex} className="shadow-sm border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold text-black">{semester.semester}</CardTitle>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                    <Printer className="h-4 w-4 mr-2" />
                    In
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="text-center py-3 px-2 font-bold text-sm">Stt</th>
                        <th className="text-left py-3 px-2 font-bold text-sm flex items-center gap-1">
                          Mã MH
                          <ChevronUp className="h-3 w-3" />
                        </th>
                        <th className="text-left py-3 px-2 font-bold text-sm">Nhóm/tổ môn học</th>
                        <th className="text-left py-3 px-2 font-bold text-sm">Tên môn học</th>
                        <th className="text-center py-3 px-2 font-bold text-sm">Số tín chỉ</th>
                        <th className="text-center py-3 px-2 font-bold text-sm">Điểm thi</th>
                        <th className="text-center py-3 px-2 font-bold text-sm">Điểm TK (10)</th>
                        <th className="text-center py-3 px-2 font-bold text-sm">Điểm TK (4)</th>
                        <th className="text-center py-3 px-2 font-bold text-sm">Điểm TK (C)</th>
                        <th className="text-center py-3 px-2 font-bold text-sm">Kết quả</th>
                        <th className="text-center py-3 px-2 font-bold text-sm">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semester.courses.map((course, courseIndex) => (
                        <tr key={courseIndex} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-3 px-2 text-center text-black font-medium">{course.stt}</td>
                          <td className="py-3 px-2 text-black font-medium">{course.code}</td>
                          <td className="py-3 px-2 text-black">{course.group}</td>
                          <td className="py-3 px-2 text-black">{course.name}</td>
                          <td className="py-3 px-2 text-center text-black">{course.credits}</td>
                          <td className="py-3 px-2 text-center text-black">{course.examScore || "-"}</td>
                          <td className="py-3 px-2 text-center text-black">{course.score10 || "-"}</td>
                          <td className="py-3 px-2 text-center text-black">{course.score4 || "-"}</td>
                          <td className="py-3 px-2 text-center text-black font-medium">{course.letterGrade || "-"}</td>
                          <td className="py-3 px-2 text-center">
                            {getStatusIcon(course.status)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowDetail(course.code)}
                              className="p-1 hover:bg-gray-100"
                            >
                              <List className="h-4 w-4 text-gray-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tổng kết học kỳ */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">- Điểm trung bình học kỳ hệ 4:</span>
                      <span className="font-bold text-black">{semester.summary.semesterAvg4}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">- Điểm trung bình học kỳ hệ 10:</span>
                      <span className="font-bold text-black">{semester.summary.semesterAvg10}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">- Số tín chỉ đạt học kỳ:</span>
                      <span className="font-bold text-black">{semester.summary.semesterCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">- Điểm trung bình tích lũy hệ 4:</span>
                      <span className="font-bold text-black">{semester.summary.cumulativeAvg4}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">- Điểm trung bình tích lũy hệ 10:</span>
                      <span className="font-bold text-black">{semester.summary.cumulativeAvg10}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">- Số tín chỉ tích lũy:</span>
                      <span className="font-bold text-black">{semester.summary.cumulativeCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">- Phân loại điểm trung bình HK:</span>
                      <Badge className={`${getClassificationColor(semester.summary.classification)} border-0 font-bold`}>
                        {semester.summary.classification}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal chi tiết điểm */}
      {showDetailModal && selectedCourse && courseDetails[selectedCourse] && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header với màu xanh dương */}
            <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-center flex-1">{courseDetails[selectedCourse].name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseDetail}
                  className="text-white hover:text-red-300 hover:bg-red-600 p-1 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Bảng chi tiết */}
            <div className="overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="text-center py-3 px-3 font-bold text-sm border-r border-blue-500">Stt</th>
                    <th className="text-left py-3 px-3 font-bold text-sm border-r border-blue-500">Tên thành phần</th>
                    <th className="text-center py-3 px-3 font-bold text-sm border-r border-blue-500">Trọng số (%)</th>
                    <th className="text-center py-3 px-3 font-bold text-sm">Điểm thành phần</th>
                  </tr>
                </thead>
                <tbody>
                  {courseDetails[selectedCourse].components.map((component, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-3 text-center text-black font-medium border-r border-gray-200">{component.stt}</td>
                      <td className="py-3 px-3 text-black border-r border-gray-200">{component.name}</td>
                      <td className="py-3 px-3 text-center text-black border-r border-gray-200">{component.weight}</td>
                      <td className="py-3 px-3 text-center text-black font-medium">{component.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Nút đóng */}
            <div className="p-4 flex justify-end border-t border-gray-200">
              <Button
                onClick={handleCloseDetail}
                className="bg-white hover:bg-red-50 text-red-600 border border-red-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
