import { type NextRequest } from "next/server";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "University Management API",
    version: "1.0.0",
    description: "API documentation for University Management System",
  },
  paths: {
    "/api/example": {
      get: {
        summary: "Get all students",
        description: "Retrieve a list of all students with related person and class info",
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/exampleWithRelations" },
                },
              },
            },
          },
          "500": { description: "Server error" },
        },
      },
      post: {
        summary: "Create a student",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NewStudentRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Created student" },
          "500": { description: "Server error" },
        },
      },
      put: {
        summary: "Update a student",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateStudentRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Updated student" },
          "500": { description: "Server error" },
        },
      },
      delete: {
        summary: "Delete a student",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id_sinh_vien: { type: "integer", example: 1 },
                },
                required: ["id_sinh_vien"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Deleted" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/semesters/timetable": {
      get: {
        summary: "Lấy danh sách các học kỳ",
        description: "Trả về danh sách tất cả các học kỳ có trong hệ thống, đã được định dạng cho combobox UI.",
        responses: {
          "200": {
            description: "Danh sách các học kỳ được trả về thành công.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Semester" }, // Tham chiếu đến schema Semester mới
                },
              },
            },
          },
          "500": {
            description: "Lỗi máy chủ nội bộ khi lấy danh sách học kỳ.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "Lỗi máy chủ nội bộ khi lấy danh sách học kỳ." }
                  }
                }
              }
            }
          },
        },
        tags: ["Danh sách học kỳ"],
      },
    },
    "/api/student/semester-schedule": {
      get: {
        summary: "Lấy thời khóa biểu học kỳ của sinh viên",
        description: "Trả về thời khóa biểu cá nhân của sinh viên đang đăng nhập cho một học kỳ cụ thể. Mặc định là học kỳ hiện tại nếu không cung cấp ID học kỳ.",
        tags: ["Thời khóa biểu học kỳ cá nhân"],
        parameters: [
          {
            name: "semesterId",
            in: "query",
            required: false,
            description: "ID của học kỳ. Nếu không cung cấp, hệ thống sẽ lấy học kỳ hiện tại.",
            schema: {
              type: "integer",
              example: 1
            }
          }
        ],
        responses: {
          "200": {
            description: "Thời khóa biểu của sinh viên được trả về thành công.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/StudentTimetableItem" },
                },
              },
            },
          },
          "404": {
            description: "Không tìm thấy sinh viên hoặc không có thời khóa biểu cho học kỳ này.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Không tìm thấy sinh viên hoặc chưa có thời khóa biểu cho học kỳ này." }
                  }
                }
              }
            }
          },
          "500": {
            description: "Lỗi máy chủ nội bộ khi lấy thời khóa biểu.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "Lỗi máy chủ nội bộ khi lấy thời khóa biểu." }
                  }
                }
              }
            }
          },
        },
      },
    },
    "/api/semesters/subject": {
      get: {
        summary: "Lấy danh sách môn học",
        description: "Trả về toàn bộ danh sách các môn học để sử dụng trong dropdown.",
        tags: ["Danh sách môn học"],
        parameters: [], // Đã loại bỏ các tham số lọc
        responses: {
          "200": {
            description: "Một danh sách các môn học.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Subject" },
                },
              },
            },
          },
          "500": {
            description: "Lỗi máy chủ nội bộ.",
          },
        },
      },
    },
    "/api/semesters/timetable/subjects": {
       get: {
        summary: "Lấy thời khóa biểu theo môn học",
        description: "Trả về danh sách các lớp học phần và lịch học chi tiết cho một môn học cụ thể trong một học kỳ.",
        tags: ["Thời khóa biểu môn học"],
        parameters: [
          {
            name: "semesterId",
            in: "query",
            required: true,
            description: "ID của học kỳ cần xem.",
            schema: {
              type: "integer",
              example: 3
            }
          },
          {
            name: "subjectId",
            in: "query",
            required: true,
            description: "ID của môn học cần xem.",
            schema: {
              type: "integer",
              example: 5
            }
          }
        ],
        responses: {
          "200": {
            description: "Thời khóa biểu môn học được trả về thành công.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SubjectTimetableItem" }
                }
              }
            }
          },
          "400": {
            description: "Thiếu tham số bắt buộc (semesterId hoặc subjectId).",
          },
          "500": {
            description: "Lỗi máy chủ nội bộ."
          }
        }
      }
    },
    "/api/semesters/faculty/": {
      get: {
        summary: "Lấy danh sách các khoa",
        description: "Trả về danh sách tất cả các khoa có trong hệ thống, đã được định dạng cho dropdown UI.",
        tags: ["Danh sách khoa"],
        responses: {
          "200": {
            description: "Danh sách các khoa được trả về thành công.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Faculty" }
                }
              }
            }
          },
          "500": {
            description: "Lỗi máy chủ nội bộ."
          }
        }
      }
    },
    "/api/semesters/timetable/faculties": {
      get: {
        summary: "Lấy thời khóa biểu theo khoa",
        description: "Trả về danh sách các lớp học phần và lịch học chi tiết cho tất cả môn học thuộc một khoa cụ thể trong một học kỳ.",
        tags: ["Thời khóa biểu theo khoa"],
        parameters: [
          {
            name: "semesterId",
            in: "query",
            required: true,
            description: "ID của học kỳ cần xem.",
            schema: { type: "integer", example: 1 }
          },
          {
            name: "facultyId",
            in: "query",
            required: true,
            description: "ID của khoa cần xem.",
            schema: { type: "integer", example: 1 }
          }
        ],
        responses: {
          "200": {
            description: "Thời khóa biểu theo khoa được trả về thành công.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SubjectTimetableItem" }
                }
              }
            }
          },
          "400": { description: "Thiếu tham số bắt buộc." },
          "404": { description: "Không tìm thấy thời khóa biểu." },
          "500": { description: "Lỗi máy chủ nội bộ." }
        }
      }
    },
    "/api/student/class-schedule": {
      get: {
        summary: "Lấy thời khóa biểu lớp của sinh viên",
        description: "Tự động xác định lớp của sinh viên đang đăng nhập và trả về thời khóa biểu của lớp đó. Khi kiểm tra API mà không đăng nhập, có thể cung cấp 'studentId' để thay thế.",
        tags: ["Thời khóa biểu lớp sinh viên"],
        security: [
            { "bearerAuth": [] }
        ],
        parameters: [
          {
            name: "semesterId",
            in: "query",
            required: true,
            description: "ID của học kỳ cần xem.",
            schema: { type: "integer", example: 1 }
          },
          {
            name: "studentId",
            in: "query",
            required: false,
            description: "ID của sinh viên. Dùng để kiểm tra API khi không có token đăng nhập.",
            schema: { type: "integer", example: 1 }
          }
        ],
        responses: {
          "200": {
            description: "Thời khóa biểu của lớp được trả về thành công.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SubjectTimetableItem" }
                }
              }
            }
          },
          "400": { description: "Thiếu tham số semesterId." },
          "401": { description: "Chưa đăng nhập và cũng không cung cấp studentId." },
          "404": { description: "Không tìm thấy thông tin sinh viên hoặc không có thời khóa biểu." },
          "500": { description: "Lỗi máy chủ nội bộ." }
        }
      }
    },
    "/api/semesters/class": {
      get: {
        summary: "Lấy thời khóa biểu theo lớp (Tra cứu)",
        description: "Trả về thời khóa biểu chi tiết cho một lớp sinh viên cụ thể trong một học kỳ. Dùng cho chức năng tra cứu công khai.",
        tags: ["Thời khóa biểu"],
        parameters: [
          {
            name: "semesterId",
            in: "query",
            required: true,
            description: "ID của học kỳ cần xem.",
            schema: { type: "integer", example: 1 }
          },
          {
            name: "classId",
            in: "query",
            required: true,
            description: "ID của lớp cần tra cứu.",
            schema: { type: "integer", example: 1 }
          }
        ],
        responses: {
          "200": {
            description: "Thời khóa biểu của lớp được trả về thành công.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SubjectTimetableItem" }
                }
              }
            }
          },
          "400": { description: "Thiếu tham số bắt buộc." },
          "404": { description: "Không tìm thấy thời khóa biểu cho lớp này." },
          "500": { description: "Lỗi máy chủ nội bộ." }
        }
      }
    },
  },

  
  components: {
    schemas: {
      Person: {
        type: "object",
        properties: {
          id_nguoi: { type: "integer", example: 1 },
          ho_ten: { type: "string", example: "Nguyen Van A" },
          ngay_sinh: { type: "string", format: "date", example: "2000-01-01" },
          gioi_tinh: { type: "string", example: "Nam" },
          email: { type: "string", format: "email", example: "a@example.com" },
          so_dien_thoai: { type: "string", example: "0123456789" },
          dia_chi: { type: "string", example: "Hanoi" },
        },
      },
      Class: {
        type: "object",
        properties: {
          id_lop: { type: "integer", example: 1 },
          ma_lop: { type: "string", example: "K18CNTTA" },
          ten_lop: { type: "string", example: "A1" },
        },
      },
      Student: {
        type: "object",
        properties: {
          id_sinh_vien: { type: "integer", example: 1 },
          id_nguoi: { type: "integer", example: 1 },
          ma_sinh_vien: { type: "string", example: "SV001" },
          id_lop: { type: "integer", example: 1 },
        },
      },
      StudentWithRelations: {
        allOf: [
          { $ref: "#/components/schemas/Student" },
          {
            type: "object",
            properties: {
              nguoi: { $ref: "#/components/schemas/Person" },
              lop: { $ref: "#/components/schemas/Class" },
            },
          },
        ],
      },
      NewStudentRequest: {
        type: "object",
        required: ["ho_ten", "ma_sinh_vien"],
        properties: {
          ho_ten: { type: "string" },
          ngay_sinh: { type: "string", format: "date" },
          gioi_tinh: { type: "string" },
          email: { type: "string", format: "email" },
          so_dien_thoai: { type: "string" },
          dia_chi: { type: "string" },
          ma_sinh_vien: { type: "string" },
          id_lop: { type: "integer" },
        },
      },
      UpdateStudentRequest: {
        type: "object",
        required: ["id_sinh_vien", "id_nguoi"],
        properties: {
          id_sinh_vien: { type: "integer" },
          id_nguoi: { type: "integer" },
          ho_ten: { type: "string" },
          ngay_sinh: { type: "string", format: "date" },
          gioi_tinh: { type: "string" },
          email: { type: "string", format: "email" },
          so_dien_thoai: { type: "string" },
          dia_chi: { type: "string" },
          ma_sinh_vien: { type: "string" },
          id_lop: { type: "integer" },
        },
      },
      Semester: {
        type: "object",
        properties: {
          id: { type: "integer", description: "ID duy nhất của học kỳ", example: 1 },
          name: { type: "string", description: "Tên học kỳ và năm học đã được định dạng (ví dụ: 'Học kỳ 1 - Năm học 2025-2026')", example: "Học kỳ 1 - Năm học 2025-2026" },
          start_date: { type: "string", format: "date", description: "Ngày bắt đầu của học kỳ (YYYY-MM-DD)", example: "2025-09-01" },
          end_date: { type: "string", format: "date", description: "Ngày kết thúc của học kỳ (YYYY-MM-DD)", example: "2025-12-15" }
        }
      },
      StudentTimetableItem: {
        type: "object",
        properties: {
            id_lich_hoc: { type: "integer", description: "ID của bản ghi lịch học (từ bảng lich_hoc)", example: 101 },
            ma_mon_hoc: { type: "string", example: "CS301", description: "Mã môn học" },
            ten_mon_hoc: { type: "string", example: "Lập trình Web", description: "Tên môn học" },
            so_tin_chi: { type: "integer", example: 3, description: "Số tín chỉ của môn học" },
            lop_hoc_phan: { type: "string", example: "K18CNTTA_LT1", description: "Tên lớp học phần (khóa học cụ thể, ví dụ: 'K18CNTTA - Lập trình Web LT1'). Tương ứng với 'nhom_to' hoặc 'lop' trong BA." },
            thu: { type: "integer", example: 2, description: "Thứ trong tuần (2=Thứ 2, ..., 7=Chủ nhật)" },
            tiet_bat_dau: { type: "integer", example: 1, description: "Tiết bắt đầu của buổi học" },
            tiet_ket_thuc: { type: "integer", example: 5, description: "Tiết kết thúc của buổi học" },
            so_tiet: { type: "integer", example: 5, description: "Tổng số tiết của buổi học (tính từ tiet_bat_dau đến tiet_ket_thuc)" },
            phong: { type: "string", example: "LEW402", description: "Mã phòng học" },
            ten_phong: { type: "string", example: "Phòng học LEW402", description: "Tên đầy đủ của phòng học" },
            giang_vien: { type: "string", example: "N.H.Đức", description: "Giảng viên phụ trách (Họ viết tắt + Tên)" },
            thoi_gian_hoc_chi_tiet_tiet: { type: "string", example: "07:00 – 11:10", description: "Khung giờ học chi tiết (VD: '07:00 – 11:10' được tính từ tiết bắt đầu và kết thúc theo quy tắc trường)" },
            thoi_gian_hoc_ngay: { type: "string", example: "19/09/25 đến 14/11/25", description: "Phạm vi ngày của khối lịch trình này (thường là phạm vi của khóa học/học kỳ)" },
            ghi_chu: { type: "string", example: "Buổi học dời sang phòng mới.", description: "Ghi chú thêm về buổi học (ví dụ: thông tin dời lịch, cập nhật...)" }
        }
      },
      RegisteredCourse: {
        type: "object",
        properties: {
          id: { type: "integer", description: "ID duy nhất của môn học", example: 101 },
          name: { type: "string", description: "Tên môn học và số tín chỉ (ví dụ: 'KIẾN TRÚC MÁY TÍNH (3)')", example: "KIẾN TRÚC MÁY TÍNH (3)" },
          code: { type: "string", description: "Mã môn học (ví dụ: '2CTS2477')", example: "2CTS2477" }
        }
      },
      Subject: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1, description: "ID duy nhất của môn học" },
          name: { type: "string", example: "Lập trình căn bản", description: "Tên môn học" },
          code: { type: "string", example: "CNTT101", description: "Mã môn học" },
          credits: { type: "integer", example: 3, description: "Số tín chỉ của môn học" },
        },
      },
      SubjectTimetableItem: {
        type: "object",
        properties: {
          courseId: { type: "integer", description: "ID của lớp học phần (khóa học)", example: 16 },
          subjectCode: { type: "string", description: "Mã môn học", example: "CNTT301" },
          subjectName: { type: "string", description: "Tên môn học (đã bao gồm số tín chỉ)", example: "Phát triển ứng dụng Web (4)" },
          credits: { type: "integer", description: "Số tín chỉ", example: 4 },
          classTarget: { type: "string", description: "Lớp sinh viên mục tiêu của học phần", example: "Công Nghệ Thông Tin 01 - Khóa 2023" },
          dayOfWeek: { type: "integer", description: "Thứ trong tuần (2-7)", example: 2 },
          startLesson: { type: "integer", description: "Tiết bắt đầu", example: 1 },
          lessonCount: { type: "integer", description: "Số tiết mỗi buổi", example: 4 },
          room: { type: "string", description: "Mã phòng học", example: "B101" },
          lecturer: { type: "string", description: "Tên giảng viên đã định dạng", example: "T.T.Bình" },
          duration: { type: "string", description: "Khoảng thời gian học (từ ngày - đến ngày)", example: "02/09/24 đến 16/12/24" }
        }
      },
      Faculty: {
        type: "object",
        properties: {
          id: { type: "integer", description: "ID duy nhất của khoa", example: 1 },
          name: { type: "string", description: "Tên đầy đủ của khoa", example: "Khoa Công nghệ Thông tin" },
          code: { type: "string", description: "Mã viết tắt của khoa", example: "CNTT" }
        }
      },
    },
  },
};

export async function GET(_request: NextRequest) {
  return new Response(JSON.stringify(swaggerDocument), {
    headers: {
      "content-type": "application/json",
    },
  });
}
