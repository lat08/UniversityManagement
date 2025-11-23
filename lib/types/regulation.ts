export type RegulationStatus = 'draft' | 'active' | 'archived';
export type RegulationAudience = 'student' | 'instructor' | 'all';
export type RegulationCategory = 'admission' | 'academic' | 'finance' | 'student_affairs' | 'general';
export type RegulationIssuingUnit =
  | 'training_dept'
  | 'admission_office'
  | 'finance_office'
  | 'student_affairs'
  | 'management_board';

export interface RegulationRecord {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly category: RegulationCategory;
  readonly issuingUnit: RegulationIssuingUnit;
  readonly targetAudience: RegulationAudience;
  readonly status: RegulationStatus;
  readonly issueDate: string;
  readonly effectiveDate: string;
  readonly expireDate: string | null;
  readonly version: string;
  readonly fileUrl: string;
  readonly fileName: string;
  readonly fileType: string | null;
  readonly createdAt: string;
  readonly updatedAt?: string | null;
  readonly isDeleted?: boolean;
}

export interface RegulationQueryParams {
  readonly pageIndex?: number;
  readonly pageSize?: number;
  readonly searchTerm?: string;
  readonly status?: RegulationStatus | 'all';
  readonly category?: RegulationCategory | 'all';
  readonly issuingUnit?: RegulationIssuingUnit | 'all';
  readonly targetAudience?: RegulationAudience | 'all';
  readonly includeDeleted?: boolean;
}

export interface RegulationListResponse {
  readonly data: readonly RegulationRecord[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export interface RegulationMutationPayload {
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly category: RegulationCategory;
  readonly issuingUnit: RegulationIssuingUnit;
  readonly status: RegulationStatus;
  readonly issueDate: string;
  readonly effectiveDate: string;
  readonly expireDate?: string | null;
  readonly targetAudience: RegulationAudience;
  readonly version: string;
  readonly fileUrl?: string | null;
  readonly fileType?: string | null;
}

