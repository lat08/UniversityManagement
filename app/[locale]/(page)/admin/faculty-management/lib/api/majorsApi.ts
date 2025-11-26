import type {
  Major,
  MajorsResponse,
  ApiResponse,
  GetMajorsParams,
  CreateMajorPayload,
  UpdateMajorPayload,
  Faculty,
  TrainingSystem,
  Curriculum,
} from '../types/types';

// Mock data cho demo
const mockCurricula: Curriculum[] = [
  { curriculumId: '1', curriculumName: 'CTĐT-KT-2023', curriculumCode: 'CTDT-KT-2023' },
  { curriculumId: '2', curriculumName: 'CTĐT-KT-2024', curriculumCode: 'CTDT-KT-2024' },
  { curriculumId: '3', curriculumName: 'CTĐT-CNTT-2023', curriculumCode: 'CTDT-CNTT-2023' },
  { curriculumId: '4', curriculumName: 'CTĐT-CNTT-2024', curriculumCode: 'CTDT-CNTT-2024' },
];

const generateMockMajors = (params: GetMajorsParams): MajorsResponse => {
  const mockMajors: Major[] = [
    {
      majorId: '1',
      majorCode: 'MMT',
      majorName: 'Mạng máy tính',
      facultyId: '1',
      facultyName: 'Khoa học máy tính',
      trainingSystemName: 'Chính quy',
      curriculumId: '3',
      curriculumName: 'CTĐT-CNTT-2023',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '2',
      majorCode: 'KTPM',
      majorName: 'Kỹ thuật phần mềm',
      facultyId: '1',
      facultyName: 'Khoa học máy tính',
      trainingSystemName: 'Chính quy',
      curriculumId: '4',
      curriculumName: 'CTĐT-CNTT-2024',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '3',
      majorCode: 'KHDL',
      majorName: 'Khoa học dữ liệu',
      facultyId: '1',
      facultyName: 'Khoa học máy tính',
      trainingSystemName: 'Chính quy',
      curriculumId: '4',
      curriculumName: 'CTĐT-CNTT-2024',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '4',
      majorCode: 'HTTT',
      majorName: 'Hệ thống thông tin',
      facultyId: '1',
      facultyName: 'Khoa học máy tính',
      trainingSystemName: 'Chính quy',
      curriculumId: '3',
      curriculumName: 'CTĐT-CNTT-2023',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '5',
      majorCode: 'ATTT',
      majorName: 'An toàn thông tin',
      facultyId: '1',
      facultyName: 'Khoa học máy tính',
      trainingSystemName: 'Chính quy',
      curriculumId: '4',
      curriculumName: 'CTĐT-CNTT-2024',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '6',
      majorCode: 'KTVB',
      majorName: 'Kỹ thuật viễn thông',
      facultyId: '2',
      facultyName: 'Kỹ thuật điện tử',
      trainingSystemName: 'Chính quy',
      curriculumId: '3',
      curriculumName: 'CTĐT-CNTT-2023',
      status: 'inactive',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '7',
      majorCode: 'DLL',
      majorName: 'Điện tử lạnh',
      facultyId: '2',
      facultyName: 'Kỹ thuật điện tử',
      trainingSystemName: 'Chính quy',
      curriculumId: '3',
      curriculumName: 'CTĐT-CNTT-2023',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '8',
      majorCode: 'KTDN',
      majorName: 'Kỹ toán doanh nghiệp',
      facultyId: '3',
      facultyName: 'Kế toán kiểm toán',
      trainingSystemName: 'Chính quy',
      curriculumId: '1',
      curriculumName: 'CTĐT-KT-2023',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '9',
      majorCode: 'KTDN',
      majorName: 'Kế toán doanh nghiệp',
      facultyId: '3',
      facultyName: 'Kế toán kiểm toán',
      trainingSystemName: 'Chính quy',
      curriculumId: '2',
      curriculumName: 'CTĐT-KT-2024',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '10',
      majorCode: 'KTQL',
      majorName: 'Kế toán quản lý',
      facultyId: '3',
      facultyName: 'Kế toán kiểm toán',
      trainingSystemName: 'Chính quy',
      curriculumId: '2',
      curriculumName: 'CTĐT-KT-2024',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '11',
      majorCode: 'KTDN',
      majorName: 'Kế toán doanh nghiệp',
      facultyId: '3',
      facultyName: 'Kế toán kiểm toán',
      trainingSystemName: 'Chính quy',
      curriculumId: '1',
      curriculumName: 'CTĐT-KT-2023',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '12',
      majorCode: 'KTCT',
      majorName: 'Kế toán công',
      facultyId: '3',
      facultyName: 'Kế toán kiểm toán',
      trainingSystemName: 'Chính quy',
      curriculumId: '1',
      curriculumName: 'CTĐT-KT-2023',
      status: 'inactive',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '13',
      majorCode: 'TKDH',
      majorName: 'Thiết kế đồ họa',
      facultyId: '4',
      facultyName: 'Công nghệ không gian',
      trainingSystemName: 'Chính quy',
      curriculumId: '4',
      curriculumName: 'CTĐT-CNTT-2024',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '14',
      majorCode: 'TKCH',
      majorName: 'Thiết kế công nghiệp',
      facultyId: '4',
      facultyName: 'Công nghệ không gian',
      trainingSystemName: 'Chính quy',
      curriculumId: '4',
      curriculumName: 'CTĐT-CNTT-2024',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '15',
      majorCode: 'TKCN',
      majorName: 'Thiết kế nội thất',
      facultyId: '4',
      facultyName: 'Công nghệ không gian',
      trainingSystemName: 'Chính quy',
      curriculumId: '3',
      curriculumName: 'CTĐT-CNTT-2023',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '16',
      majorCode: 'KTCN',
      majorName: 'Kỹ thuật cơ khí',
      facultyId: '5',
      facultyName: 'Kỹ toán tiến tiên',
      trainingSystemName: 'Chính quy',
      curriculumId: '4',
      curriculumName: 'CTĐT-CNTT-2024',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '17',
      majorCode: 'KTOT',
      majorName: 'Kỹ thuật ô tô',
      facultyId: '5',
      facultyName: 'Kỹ toán tiến tiên',
      trainingSystemName: 'Chính quy',
      curriculumId: '3',
      curriculumName: 'CTĐT-CNTT-2023',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '18',
      majorCode: 'KTDD',
      majorName: 'Kỹ thuật điện',
      facultyId: '5',
      facultyName: 'Kỹ toán tiến tiên',
      trainingSystemName: 'Chính quy',
      curriculumId: '3',
      curriculumName: 'CTĐT-CNTT-2023',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '19',
      majorCode: 'KTCM',
      majorName: 'Kỹ thuật cơ điện tử',
      facultyId: '5',
      facultyName: 'Kỹ toán tiến tiên',
      trainingSystemName: 'Chính quy',
      curriculumId: '4',
      curriculumName: 'CTĐT-CNTT-2024',
      status: 'inactive',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '20',
      majorCode: 'KTCN',
      majorName: 'Kỹ thuật cơ khí',
      facultyId: '5',
      facultyName: 'Kỹ toán tiến tiên',
      trainingSystemName: 'Chính quy',
      curriculumId: '4',
      curriculumName: 'CTĐT-CNTT-2024',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
    {
      majorId: '21',
      majorCode: 'KTQT',
      majorName: 'Kỹ thuật quản lý công nghiệp',
      facultyId: '5',
      facultyName: 'Kỹ toán tiến tiên',
      trainingSystemName: 'Chính quy',
      curriculumId: '3',
      curriculumName: 'CTĐT-CNTT-2023',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z',
    },
  ];

  let filteredMajors = mockMajors;

  // Filter by search keyword
  if (params.searchKeyword) {
    const keyword = params.searchKeyword.toLowerCase();
    filteredMajors = filteredMajors.filter(
      (m) =>
        m.majorName.toLowerCase().includes(keyword) ||
        m.majorCode.toLowerCase().includes(keyword) ||
        m.facultyName.toLowerCase().includes(keyword)
    );
  }

  // Filter by faculty
  if (params.facultyId) {
    filteredMajors = filteredMajors.filter((m) => m.facultyId === params.facultyId);
  }

  // Filter by curriculum
  if (params.curriculumId) {
    filteredMajors = filteredMajors.filter((m) => m.curriculumId === params.curriculumId);
  }

  // Filter by status
  if (params.status) {
    filteredMajors = filteredMajors.filter((m) => m.status === params.status);
  }

  const pageNumber = params.pageNumber || 1;
  const pageSize = params.pageSize || 20;
  const totalCount = filteredMajors.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMajors = filteredMajors.slice(startIndex, endIndex);

  const activeMajors = mockMajors.filter((m) => m.status === 'active').length;
  const inactiveMajors = mockMajors.filter((m) => m.status === 'inactive').length;

  return {
    majors: paginatedMajors,
    pagination: {
      currentPage: pageNumber,
      pageSize,
      totalCount,
      totalPages,
    },
    statistics: {
      totalMajors: mockMajors.length,
      activeMajors,
      inactiveMajors,
    },
  };
};

const mockFaculties: Faculty[] = [
  { facultyId: '1', facultyName: 'Khoa học máy tính', facultyCode: 'KHMT' },
  { facultyId: '2', facultyName: 'Kỹ thuật điện tử', facultyCode: 'KTDT' },
  { facultyId: '3', facultyName: 'Kế toán kiểm toán', facultyCode: 'KTKT' },
  { facultyId: '4', facultyName: 'Công nghệ không gian', facultyCode: 'CNKG' },
  { facultyId: '5', facultyName: 'Kỹ toán tiến tiên', facultyCode: 'KTTT' },
];

const mockTrainingSystems: TrainingSystem[] = [
  { trainingSystemId: '1', trainingSystemName: 'Chính quy', trainingSystemCode: 'CQ' },
  { trainingSystemId: '2', trainingSystemName: 'Vừa làm vừa học', trainingSystemCode: 'VLVH' },
  { trainingSystemId: '3', trainingSystemName: 'Từ xa', trainingSystemCode: 'TX' },
];

export const majorsApi = {
  getMajors: async (params: GetMajorsParams = {}): Promise<ApiResponse<MajorsResponse>> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const data = generateMockMajors(params);
    
    return {
      success: true,
      message: 'Lấy danh sách chuyên ngành thành công',
      data,
    };
  },

  getFaculties: async (): Promise<ApiResponse<Faculty[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Lấy danh sách ngành học thành công',
      data: mockFaculties,
    };
  },

  getTrainingSystems: async (): Promise<ApiResponse<TrainingSystem[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Lấy danh sách hệ đào tạo thành công',
      data: mockTrainingSystems,
    };
  },

  getCurricula: async (): Promise<ApiResponse<Curriculum[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Lấy danh sách CTDT thành công',
      data: mockCurricula,
    };
  },

  createMajor: async (payload: CreateMajorPayload): Promise<ApiResponse<Major>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const newMajor: Major = {
      majorId: Math.random().toString(36).substr(2, 9),
      majorCode: payload.majorCode,
      majorName: payload.majorName,
      facultyId: payload.facultyId,
      facultyName: mockFaculties.find((f) => f.facultyId === payload.facultyId)?.facultyName || '',
      trainingSystemName: mockTrainingSystems.find((t) => t.trainingSystemId === payload.trainingSystemId)?.trainingSystemName || '',
      curriculumId: payload.curriculumId,
      curriculumName: mockCurricula.find((c) => c.curriculumId === payload.curriculumId)?.curriculumName || '',
      status: payload.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Thêm chuyên ngành thành công',
      data: newMajor,
    };
  },

  updateMajor: async (payload: UpdateMajorPayload): Promise<ApiResponse<Major>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updatedMajor: Major = {
      majorId: payload.majorId,
      majorCode: payload.majorCode,
      majorName: payload.majorName,
      facultyId: payload.facultyId,
      facultyName: mockFaculties.find((f) => f.facultyId === payload.facultyId)?.facultyName || '',
      trainingSystemName: mockTrainingSystems.find((t) => t.trainingSystemId === payload.trainingSystemId)?.trainingSystemName || '',
      curriculumId: payload.curriculumId,
      curriculumName: mockCurricula.find((c) => c.curriculumId === payload.curriculumId)?.curriculumName || '',
      status: payload.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Cập nhật chuyên ngành thành công',
      data: updatedMajor,
    };
  },

  deleteMajor: async (): Promise<ApiResponse<null>> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
      success: true,
      message: 'Xóa chuyên ngành thành công',
      data: null,
    };
  },

  bulkUpdateMajors: async (payload: {
    majorIds: string[];
    facultyId?: string;
    curriculumId?: string;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<null>> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Bulk update majors:', payload);
    return {
      success: true,
      message: `Đã cập nhật ${payload.majorIds.length} chuyên ngành`,
      data: null,
    };
  },

  bulkDeleteMajors: async (majorIds: string[]): Promise<ApiResponse<null>> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Bulk delete majors:', majorIds);
    return {
      success: true,
      message: `Đã xóa ${majorIds.length} chuyên ngành`,
      data: null,
    };
  },
};
