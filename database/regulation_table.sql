IF OBJECT_ID('dbo.regulation', 'U') IS NOT NULL
    DROP TABLE dbo.regulation;
GO

CREATE TABLE dbo.regulation (
    regulation_id UNIQUEIDENTIFIER NOT NULL 
        CONSTRAINT PK_regulation PRIMARY KEY DEFAULT NEWID(),
    regulation_code NVARCHAR(50) NOT NULL,
    regulation_name NVARCHAR(200) NOT NULL,
    regulation_description NVARCHAR(2000) NOT NULL,
    category NVARCHAR(50) NOT NULL
        CONSTRAINT CK_regulation_category 
        CHECK (category IN ('admission', 'academic', 'finance', 'student_affairs', 'general')),
    issuing_unit NVARCHAR(50) NOT NULL
        CONSTRAINT CK_regulation_issuing_unit 
        CHECK (issuing_unit IN ('training_dept', 'admission_office', 'finance_office', 'student_affairs', 'management_board')),
    target_audience NVARCHAR(20) NOT NULL
        CONSTRAINT CK_regulation_target_audience 
        CHECK (target_audience IN ('student', 'instructor', 'all')),
    status NVARCHAR(20) NOT NULL
        CONSTRAINT CK_regulation_status 
        CHECK (status IN ('draft', 'active', 'archived')),
    issue_date DATE NOT NULL,
    effective_date DATE NOT NULL,
    expire_date DATE NULL,
    version NVARCHAR(20) NOT NULL DEFAULT 'v1.0',
    pdf_file_path NVARCHAR(1000) NOT NULL,
    file_type NVARCHAR(20) NULL,
    created_by_admin UNIQUEIDENTIFIER NOT NULL,
    updated_by_admin UNIQUEIDENTIFIER NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NULL,
    is_deleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_regulation_created_by_admin 
        FOREIGN KEY (created_by_admin) 
        REFERENCES dbo.admin(admin_id) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION,
    CONSTRAINT FK_regulation_updated_by_admin 
        FOREIGN KEY (updated_by_admin) 
        REFERENCES dbo.admin(admin_id) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION,
    CONSTRAINT UQ_regulation_code 
        UNIQUE (regulation_code),
    CONSTRAINT CK_regulation_dates 
        CHECK (
            effective_date >= issue_date 
            AND (expire_date IS NULL OR expire_date >= effective_date)
        )
);
GO

CREATE NONCLUSTERED INDEX IX_regulation_status_effective_date 
    ON dbo.regulation (status, effective_date DESC, is_deleted)
    INCLUDE (regulation_name, category, target_audience);
GO

CREATE NONCLUSTERED INDEX IX_regulation_category_target 
    ON dbo.regulation (category, target_audience, is_deleted)
    INCLUDE (status, effective_date);
GO

CREATE NONCLUSTERED INDEX IX_regulation_search 
    ON dbo.regulation (regulation_name, regulation_code)
    WHERE is_deleted = 0;
GO

CREATE NONCLUSTERED INDEX IX_regulation_is_deleted 
    ON dbo.regulation (is_deleted, created_at DESC)
    INCLUDE (status, category);
GO

CREATE NONCLUSTERED INDEX IX_regulation_issuing_unit 
    ON dbo.regulation (issuing_unit, is_deleted)
    INCLUDE (status, effective_date);
GO

CREATE NONCLUSTERED INDEX IX_regulation_expire_date 
    ON dbo.regulation (expire_date, is_deleted)
    WHERE expire_date IS NOT NULL
    INCLUDE (status, effective_date);
GO

DECLARE @admin_id UNIQUEIDENTIFIER = N'00000000-0000-0000-0000-000000009999';

INSERT INTO dbo.regulation (
    regulation_id,
    regulation_code,
    regulation_name,
    regulation_description,
    category,
    issuing_unit,
    target_audience,
    status,
    issue_date,
    effective_date,
    expire_date,
    version,
    pdf_file_path,
    file_type,
    created_by_admin
) VALUES
(N'2D4A0AE3-9304-4961-93CC-AC4724CCB9FE', N'QCTS-001', N'Quy chế tuyển sinh và đào tạo Thạc sĩ', N'Quy định chi tiết về quy trình tuyển sinh, điều kiện dự tuyển, hình thức đào tạo, chương trình học, thời gian đào tạo, điều kiện tốt nghiệp và cấp bằng cho sinh viên theo học chương trình Thạc sĩ. Bao gồm các quy định về luận văn, hội đồng chấm luận văn, tiêu chuẩn đầu ra và quyền lợi của học viên cao học.', N'admission', N'training_dept', N'student', N'active', '2024-01-05', '2024-02-01', NULL, N'v1.0', N'https://baygtczqmdoolsvkxgpr.supabase.co/storage/v1/object/public/regulations/Admission_and_Training_Regulations_for_Master''s_Programs.pdf', N'pdf', @admin_id),
(N'1B59D344-2C57-49C5-8A80-FCAE77268234', N'QCTS-002', N'Quy chế tuyển sinh và đào tạo Thạc sĩ', N'Quy định chi tiết về quy trình tuyển sinh, điều kiện dự tuyển, hình thức đào tạo, chương trình học, thời gian đào tạo, điều kiện tốt nghiệp và cấp bằng cho sinh viên theo học chương trình Thạc sĩ. Bao gồm các quy định về luận văn, hội đồng chấm luận văn, tiêu chuẩn đầu ra và quyền lợi của học viên cao học.', N'admission', N'training_dept', N'instructor', N'active', '2024-01-05', '2024-02-01', NULL, N'v1.0', N'https://baygtczqmdoolsvkxgpr.supabase.co/storage/v1/object/public/regulations/Admission_and_Training_Regulations_for_Master''s_Programs.pdf', N'pdf', @admin_id),
(N'8E6B75B8-E935-486C-87E3-979D2C51C24D', N'QDCSVC-001', N'Quy định sử dụng cơ sở vật chất', N'Quy định về việc sử dụng và quản lý các cơ sở vật chất của trường bao gồm phòng học, giảng đường, thư viện, phòng thí nghiệm, phòng máy tính, khu thể thao, ký túc xá. Hướng dẫn đăng ký sử dụng, quy tắc ứng xử, bảo quản tài sản, xử lý vi phạm và trách nhiệm của sinh viên khi sử dụng các tiện ích chung của nhà trường.', N'student_affairs', N'student_affairs', N'student', N'active', '2023-09-01', '2023-09-15', NULL, N'v1.2', N'https://baygtczqmdoolsvkxgpr.supabase.co/storage/v1/object/public/regulations/Regulations_on_the_Use_of_Facilities.pdf', N'pdf', @admin_id),
(N'C1E9C2B7-0B94-4983-8886-0CD7DBFBB526', N'QDCSVC-002', N'Quy định sử dụng cơ sở vật chất', N'Quy định về việc sử dụng và quản lý các cơ sở vật chất của trường bao gồm phòng học, giảng đường, thư viện, phòng thí nghiệm, phòng máy tính, khu thể thao, ký túc xá. Hướng dẫn đăng ký sử dụng, quy tắc ứng xử, bảo quản tài sản, xử lý vi phạm và trách nhiệm của sinh viên khi sử dụng các tiện ích chung của nhà trường.', N'student_affairs', N'student_affairs', N'instructor', N'active', '2023-09-01', '2023-09-15', NULL, N'v1.2', N'https://baygtczqmdoolsvkxgpr.supabase.co/storage/v1/object/public/regulations/Regulations_on_the_Use_of_Facilities.pdf', N'pdf', @admin_id),
(N'D97F8EBC-9BC7-4A43-BAC2-0B35F9F78755', N'QDHPTC-001', N'Quy định học phí và chính sách miễn giảm', N'Quy định mức học phí theo từng ngành đào tạo, hình thức thanh toán, thời hạn nộp học phí, chính sách miễn giảm học phí cho sinh viên diện chính sách, sinh viên có thành tích học tập xuất sắc, sinh viên thuộc hộ nghèo, cận nghèo. Hướng dẫn thủ tục xin hoãn nộp học phí, xin hỗ trợ tài chính, vay vốn ngân hàng và các chế độ học bổng khác.', N'finance', N'finance_office', N'student', N'active', '2024-04-10', '2024-05-01', '2026-12-31', N'v2.0', N'https://baygtczqmdoolsvkxgpr.supabase.co/storage/v1/object/public/regulations/Tuition_Fees_and_Exemption_Policies.pdf', N'pdf', @admin_id),
(N'D63C4DEB-D998-4C99-B09B-2E409DCDC14A', N'QDHPTC-002', N'Quy định học phí và chính sách miễn giảm', N'Quy định mức học phí theo từng ngành đào tạo, hình thức thanh toán, thời hạn nộp học phí, chính sách miễn giảm học phí cho sinh viên diện chính sách, sinh viên có thành tích học tập xuất sắc, sinh viên thuộc hộ nghèo, cận nghèo. Hướng dẫn thủ tục xin hoãn nộp học phí, xin hỗ trợ tài chính, vay vốn ngân hàng và các chế độ học bổng khác.', N'finance', N'finance_office', N'instructor', N'active', '2024-04-10', '2024-05-01', '2026-12-31', N'v2.0', N'https://baygtczqmdoolsvkxgpr.supabase.co/storage/v1/object/public/regulations/Tuition_Fees_and_Exemption_Policies.pdf', N'pdf', @admin_id),
(N'6DB0AB56-F926-4EF2-B8F5-7288F808138D', N'QCDH-001', N'Quy chế đào tạo đại học hệ chính quy', N'Quy định toàn diện về hệ thống đào tạo đại học chính quy bao gồm chương trình khung, phương thức tổ chức dạy và học, quy định về tín chỉ, đăng ký học phần, điều kiện dự thi, hình thức kiểm tra đánh giá, quy đổi điểm, xếp loại học lực. Các quy định về chuyển ngành, chuyển trường, tạm ngừng học, thôi học, điều kiện công nhận tốt nghiệp và cấp bằng tốt nghiệp đại học.', N'academic', N'training_dept', N'student', N'active', '2022-08-01', '2022-09-01', NULL, N'v1.5', N'https://baygtczqmdoolsvkxgpr.supabase.co/storage/v1/object/public/regulations/Undergraduate_Training_Regulations.pdf', N'pdf', @admin_id),
(N'962C5320-27DD-4D9E-B18A-65462CE3F0B5', N'QCDH-002', N'Quy chế đào tạo đại học hệ chính quy', N'Quy định toàn diện về hệ thống đào tạo đại học chính quy bao gồm chương trình khung, phương thức tổ chức dạy và học, quy định về tín chỉ, đăng ký học phần, điều kiện dự thi, hình thức kiểm tra đánh giá, quy đổi điểm, xếp loại học lực. Các quy định về chuyển ngành, chuyển trường, tạm ngừng học, thôi học, điều kiện công nhận tốt nghiệp và cấp bằng tốt nghiệp đại học.', N'academic', N'training_dept', N'instructor', N'active', '2022-08-01', '2022-09-01', NULL, N'v1.5', N'https://baygtczqmdoolsvkxgpr.supabase.co/storage/v1/object/public/regulations/Undergraduate_Training_Regulations.pdf', N'pdf', @admin_id);
GO

