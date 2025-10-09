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

    // API Dashboard Sinh Viên
    "/api/student/dashboard": {
      post: {
        summary: "Lấy dữ liệu tổng quan dashboard sinh viên",
        description:
          "Trả về thông tin tổng hợp cho trang dashboard sinh viên gồm thống kê học tập, lịch học, lịch thi, kết quả học tập trong học kỳ hiện tại, thông báo và các lớp đang học.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id_sinh_vien: { type: "integer", example: 12 },
                  id_hoc_ky: { type: "integer", example: 3 },
                },
                required: ["id_sinh_vien"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Thông tin tổng quan dashboard sinh viên",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sinhVien: { $ref: "#/components/schemas/StudentWithRelations" },
                    thongKe: {
                      type: "object",
                      properties: {
                        diem_tb_tich_luy: { type: "number", example: 7.8 },
                        so_tin_chi_dat: { type: "integer", example: 45 },
                        xep_loai: { type: "string", example: "Khá" },
                      },
                    },
                    lichHocTrongTuan: { type: "integer", example: 5 },
                    lichThiTrongTuan: { type: "integer", example: 1 },
                    ketQuaHocTapChiTiet: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          maMonHoc: { type: "string", example: "CS101" },
                          tenMonHoc: { type: "string", example: "Lập trình cơ bản" },
                          soTinChi: { type: "integer", example: 3 },
                          diemTongKet: { type: "number", example: 7.5 },
                          datHP: { type: "string", example: "Đạt" },
                        },
                      },
                    },
                    thongBao: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id_thong_bao: { type: "integer", example: 1 },
                          tieu_de: { type: "string", example: "Thông báo thi cuối kỳ" },
                          noi_dung: {
                            type: "string",
                            example: "Thi cuối kỳ sẽ diễn ra vào ngày 20/12.",
                          },
                          ngay_tao: {
                            type: "string",
                            format: "date-time",
                            example: "2025-10-08T10:00:00Z",
                          },
                        },
                      },
                    },
                    lopDangHoc: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id_khoa_hoc: { type: "integer", example: 5 },
                          ten_khoa_hoc: {
                            type: "string",
                            example: "Công nghệ phần mềm",
                          },
                          mon_hoc: {
                            type: "object",
                            properties: {
                              ten_mon_hoc: {
                                type: "string",
                                example: "Phát triển Web",
                              },
                              ma_mon_hoc: { type: "string", example: "WEB301" },
                              so_tin_chi: { type: "integer", example: 3 },
                            },
                          },
                          giang_vien: {
                            type: "object",
                            properties: {
                              id_giang_vien: { type: "integer", example: 4 },
                              nguoi: {
                                type: "object",
                                properties: {
                                  ho_ten: {
                                    type: "string",
                                    example: "Nguyễn Văn B",
                                  },
                                  email: {
                                    type: "string",
                                    example: "nguyenvanb@example.com",
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Thiếu id_sinh_vien" },
          "500": { description: "Lỗi máy chủ" },
        },
      },
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
          { $ref: "#/components/schemas/example" },
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
