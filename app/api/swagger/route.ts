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
