-- =============================================
-- Hệ thống Quản lý Đại học - Dữ liệu Mẫu (PostgreSQL)
-- Chạy trong database: university_management
-- =============================================

SET client_encoding = 'UTF8';
SET TIME ZONE 'Asia/Ho_Chi_Minh';

-- Thông báo bắt đầu
DO $$ BEGIN RAISE NOTICE '=========================================='; RAISE NOTICE 'Bắt đầu chèn dữ liệu mẫu...'; RAISE NOTICE '=========================================='; END $$;


-- =============================================
-- 1. BẢNG nguoi (50 người)
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng nguoi...';
END
$$;

-- Chèn trực tiếp với id (SERIAL cho cột id_nguoi)
INSERT INTO nguoi (id_nguoi, ho_ten, ngay_sinh, gioi_tinh, email, so_dien_thoai, dia_chi, anh_dai_dien)
VALUES
(1, 'Nguyễn Văn Quản', '1980-05-15', 'Nam', 'admin01@university.edu.vn', '0901234501', '123 Lê Lợi, Q1, TP.HCM', '/images/avatars/admin01.jpg'),
(2, 'Trần Thị Bích', '1982-08-20', 'Nữ', 'admin02@university.edu.vn', '0901234502', '456 Nguyễn Huệ, Q1, TP.HCM', '/images/avatars/admin02.jpg'),
(3, 'Lê Văn Cường', '1978-03-10', 'Nam', 'admin03@university.edu.vn', '0901234503', '789 Lý Tự Trọng, Q1, TP.HCM', '/images/avatars/admin03.jpg'),
(4, 'Phạm Thị Dung', '1985-11-25', 'Nữ', 'admin04@university.edu.vn', '0901234504', '321 Hai Bà Trưng, Q3, TP.HCM', '/images/avatars/admin04.jpg'),
(5, 'Hoàng Văn Em', '1981-07-08', 'Nam', 'admin05@university.edu.vn', '0901234505', '654 Điện Biên Phủ, Q3, TP.HCM', '/images/avatars/admin05.jpg'),
(6, 'Nguyễn Văn An', '1975-09-01', 'Nam', 'nguyen.van.a@university.edu.vn', '0912345601', '111 Cách Mạng Tháng 8, Q10, TP.HCM', '/images/avatars/gv001.jpg'),
(7, 'Trần Thị Bình', '1978-03-15', 'Nữ', 'tran.thi.b@university.edu.vn', '0912345602', '222 Trần Hưng Đạo, Q5, TP.HCM', '/images/avatars/gv002.jpg'),
(8, 'Lê Văn Cường', '1973-08-20', 'Nam', 'le.van.c@university.edu.vn', '0912345603', '333 Nguyễn Trãi, Q5, TP.HCM', '/images/avatars/gv003.jpg'),
(9, 'Phạm Thị Dung', '1980-01-10', 'Nữ', 'pham.thi.d@university.edu.vn', '0912345604', '444 Lý Chính Thắng, Q3, TP.HCM', '/images/avatars/gv004.jpg'),
(10, 'Hoàng Văn Em', '1972-09-01', 'Nam', 'hoang.van.e@university.edu.vn', '0912345605', '555 Hoàng Văn Thụ, Tân Bình, TP.HCM', '/images/avatars/gv005.jpg'),
(11, 'Võ Thị Phượng', '1979-02-15', 'Nữ', 'vo.thi.f@university.edu.vn', '0912345606', '666 Cộng Hòa, Tân Bình, TP.HCM', '/images/avatars/gv006.jpg'),
(12, 'Đặng Văn Giang', '1976-07-01', 'Nam', 'dang.van.g@university.edu.vn', '0912345607', '777 Phan Văn Trị, Gò Vấp, TP.HCM', '/images/avatars/gv007.jpg'),
(13, 'Bùi Thị Hà', '1977-09-01', 'Nữ', 'bui.thi.h@university.edu.vn', '0912345608', '888 Quang Trung, Gò Vấp, TP.HCM', '/images/avatars/gv008.jpg'),
(14, 'Đỗ Văn Ích', '1974-03-15', 'Nam', 'do.van.i@university.edu.vn', '0912345609', '999 Phan Huy Ích, Tân Bình, TP.HCM', '/images/avatars/gv009.jpg'),
(15, 'Hồ Thị Kim', '1981-08-01', 'Nữ', 'ho.thi.k@university.edu.vn', '0912345610', '101 Lạc Long Quân, Q11, TP.HCM', '/images/avatars/gv010.jpg'),
(16, 'Ngô Văn Long', '1971-09-01', 'Nam', 'ngo.van.l@university.edu.vn', '0912345611', '202 Âu Cơ, Tân Phú, TP.HCM', '/images/avatars/gv011.jpg'),
(17, 'Dương Thị Mai', '1983-01-15', 'Nữ', 'duong.thi.m@university.edu.vn', '0912345612', '303 Lũy Bán Bích, Tân Phú, TP.HCM', '/images/avatars/gv012.jpg'),
(18, 'Lý Văn Nam', '1976-02-01', 'Nam', 'ly.van.n@university.edu.vn', '0912345613', '404 Tân Kỳ Tân Quý, Tân Phú, TP.HCM', '/images/avatars/gv013.jpg'),
(19, 'Trương Thị Oanh', '1979-07-15', 'Nữ', 'truong.thi.o@university.edu.vn', '0912345614', '505 Hòa Bình, Tân Phú, TP.HCM', '/images/avatars/gv014.jpg'),
(20, 'Phan Văn Phúc', '1975-09-01', 'Nam', 'phan.van.p@university.edu.vn', '0912345615', '606 Hậu Giang, Q6, TP.HCM', '/images/avatars/gv015.jpg'),
(21, 'Nguyễn Văn Anh', '2003-05-15', 'Nam', 'sv001@student.university.edu.vn', '0923456701', '123 Nguyễn Thị Minh Khai, Q1, TP.HCM', '/images/avatars/sv001.jpg'),
(22, 'Trần Thị Bảo', '2003-08-20', 'Nữ', 'sv002@student.university.edu.vn', '0923456702', '456 Lê Văn Sỹ, Q3, TP.HCM', '/images/avatars/sv002.jpg'),
(23, 'Lê Văn Cường', '2003-03-10', 'Nam', 'sv003@student.university.edu.vn', '0923456703', '789 Võ Văn Tần, Q3, TP.HCM', '/images/avatars/sv003.jpg'),
(24, 'Phạm Thị Duyên', '2003-11-25', 'Nữ', 'sv004@student.university.edu.vn', '0923456704', '321 Điện Biên Phủ, Q10, TP.HCM', '/images/avatars/sv004.jpg'),
(25, 'Hoàng Văn Em', '2003-07-08', 'Nam', 'sv005@student.university.edu.vn', '0923456705', '654 Cách Mạng Tháng 8, Q10, TP.HCM', '/images/avatars/sv005.jpg'),
(26, 'Võ Thị Phương', '2003-12-30', 'Nữ', 'sv006@student.university.edu.vn', '0923456706', '987 Trần Hưng Đạo, Q5, TP.HCM', '/images/avatars/sv006.jpg'),
(27, 'Đặng Văn Giang', '2003-04-18', 'Nam', 'sv007@student.university.edu.vn', '0923456707', '147 Nguyễn Trãi, Q5, TP.HCM', '/images/avatars/sv007.jpg'),
(28, 'Bùi Thị Hồng', '2003-09-05', 'Nữ', 'sv008@student.university.edu.vn', '0923456708', '258 Lý Chính Thắng, Q3, TP.HCM', '/images/avatars/sv008.jpg'),
(29, 'Đỗ Văn Ích', '2003-06-22', 'Nam', 'sv009@student.university.edu.vn', '0923456709', '369 Hoàng Văn Thụ, Tân Bình, TP.HCM', '/images/avatars/sv009.jpg'),
(30, 'Hồ Thị Khánh', '2003-10-14', 'Nữ', 'sv010@student.university.edu.vn', '0923456710', '741 Cộng Hòa, Tân Bình, TP.HCM', '/images/avatars/sv010.jpg'),
(31, 'Ngô Văn Linh', '2003-02-28', 'Nam', 'sv011@student.university.edu.vn', '0923456711', '852 Phan Văn Trị, Gò Vấp, TP.HCM', '/images/avatars/sv011.jpg'),
(32, 'Dương Thị My', '2003-08-17', 'Nữ', 'sv012@student.university.edu.vn', '0923456712', '963 Quang Trung, Gò Vấp, TP.HCM', '/images/avatars/sv012.jpg'),
(33, 'Lý Văn Nghĩa', '2003-05-09', 'Nam', 'sv013@student.university.edu.vn', '0923456713', '159 Phan Huy Ích, Tân Bình, TP.HCM', '/images/avatars/sv013.jpg'),
(34, 'Trương Thị Oanh', '2003-11-03', 'Nữ', 'sv014@student.university.edu.vn', '0923456714', '357 Lạc Long Quân, Q11, TP.HCM', '/images/avatars/sv014.jpg'),
(35, 'Phan Văn Phong', '2003-07-26', 'Nam', 'sv015@student.university.edu.vn', '0923456715', '486 Âu Cơ, Tân Phú, TP.HCM', '/images/avatars/sv015.jpg'),
(36, 'Mai Thị Quỳnh', '2003-03-19', 'Nữ', 'sv016@student.university.edu.vn', '0923456716', '753 Lũy Bán Bích, Tân Phú, TP.HCM', '/images/avatars/sv016.jpg'),
(37, 'Trịnh Văn Rồng', '2003-09-12', 'Nam', 'sv017@student.university.edu.vn', '0923456717', '864 Tân Kỳ Tân Quý, Tân Phú, TP.HCM', '/images/avatars/sv017.jpg'),
(38, 'Vũ Thị Sang', '2003-12-07', 'Nữ', 'sv018@student.university.edu.vn', '0923456718', '975 Hòa Bình, Tân Phú, TP.HCM', '/images/avatars/sv018.jpg'),
(39, 'Đinh Văn Tài', '2003-06-01', 'Nam', 'sv019@student.university.edu.vn', '0923456719', '186 Hậu Giang, Q6, TP.HCM', '/images/avatars/sv019.jpg'),
(40, 'Cao Thị Uyên', '2003-10-23', 'Nữ', 'sv020@student.university.edu.vn', '0923456720', '297 Minh Phụng, Q6, TP.HCM', '/images/avatars/sv020.jpg'),
(41, 'Huỳnh Văn Vũ', '2003-04-16', 'Nam', 'sv021@student.university.edu.vn', '0923456721', '408 Bình Thới, Q11, TP.HCM', '/images/avatars/sv021.jpg'),
(42, 'Đoàn Thị Xuân', '2003-08-29', 'Nữ', 'sv022@student.university.edu.vn', '0923456722', '519 Lê Đại Hành, Q11, TP.HCM', '/images/avatars/sv022.jpg'),
(43, 'Lương Văn Yên', '2003-05-11', 'Nam', 'sv023@student.university.edu.vn', '0923456723', '630 Đường 3/2, Q10, TP.HCM', '/images/avatars/sv023.jpg'),
(44, 'Tô Thị Zoan', '2003-11-24', 'Nữ', 'sv024@student.university.edu.vn', '0923456724', '741 Sư Vạn Hạnh, Q10, TP.HCM', '/images/avatars/sv024.jpg'),
(45, 'Quách Văn An', '2003-07-07', 'Nam', 'sv025@student.university.edu.vn', '0923456725', '852 Nguyễn Chí Thanh, Q5, TP.HCM', '/images/avatars/sv025.jpg'),
(46, 'Tăng Thị Bích', '2003-02-20', 'Nữ', 'sv026@student.university.edu.vn', '0923456726', '963 Trần Bình Trọng, Q5, TP.HCM', '/images/avatars/sv026.jpg'),
(47, 'Âu Văn Cảnh', '2003-09-13', 'Nam', 'sv027@student.university.edu.vn', '0923456727', '174 Hai Bà Trưng, Q1, TP.HCM', '/images/avatars/sv027.jpg'),
(48, 'Ông Thị Diễm', '2003-12-06', 'Nữ', 'sv028@student.university.edu.vn', '0923456728', '285 Pasteur, Q1, TP.HCM', '/images/avatars/sv028.jpg'),
(49, 'Uông Văn Đức', '2003-06-18', 'Nam', 'sv029@student.university.edu.vn', '0923456729', '396 Nguyễn Đình Chiểu, Q3, TP.HCM', '/images/avatars/sv029.jpg'),
(50, 'Từ Thị Linh', '2003-10-31', 'Nữ', 'sv030@student.university.edu.vn', '0923456730', '507 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', '/images/avatars/sv030.jpg');

-- Cập nhật sequence id_nguoi
SELECT setval(pg_get_serial_sequence('nguoi','id_nguoi'), (SELECT MAX(id_nguoi) FROM nguoi));


-- =============================================
-- 2. BẢNG nguoi_dung (50 người dùng)
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng nguoi_dung...';
END
$$;

INSERT INTO nguoi_dung (id_nguoi_dung, id_nguoi, ten_dang_nhap, mat_khau_hash, mat_khau_salt, email_da_xac_thuc, trang_thai)
VALUES
(1, 1, 'admin01', 'hashed_password_1', 'salt_1', TRUE, 'active'),
(2, 2, 'admin02', 'hashed_password_2', 'salt_2', TRUE, 'active'),
(3, 3, 'admin03', 'hashed_password_3', 'salt_3', TRUE, 'active'),
(4, 4, 'admin04', 'hashed_password_4', 'salt_4', TRUE, 'active'),
(5, 5, 'admin05', 'hashed_password_5', 'salt_5', TRUE, 'active'),
(6, 6, 'gv001', 'hashed_password_6', 'salt_6', TRUE, 'active'),
(7, 7, 'gv002', 'hashed_password_7', 'salt_7', TRUE, 'active'),
(8, 8, 'gv003', 'hashed_password_8', 'salt_8', TRUE, 'active'),
(9, 9, 'gv004', 'hashed_password_9', 'salt_9', TRUE, 'active'),
(10, 10, 'gv005', 'hashed_password_10', 'salt_10', TRUE, 'active'),
(11, 11, 'gv006', 'hashed_password_11', 'salt_11', TRUE, 'active'),
(12, 12, 'gv007', 'hashed_password_12', 'salt_12', TRUE, 'active'),
(13, 13, 'gv008', 'hashed_password_13', 'salt_13', TRUE, 'active'),
(14, 14, 'gv009', 'hashed_password_14', 'salt_14', TRUE, 'active'),
(15, 15, 'gv010', 'hashed_password_15', 'salt_15', TRUE, 'active'),
(16, 16, 'gv011', 'hashed_password_16', 'salt_16', TRUE, 'active'),
(17, 17, 'gv012', 'hashed_password_17', 'salt_17', TRUE, 'active'),
(18, 18, 'gv013', 'hashed_password_18', 'salt_18', TRUE, 'active'),
(19, 19, 'gv014', 'hashed_password_19', 'salt_19', TRUE, 'active'),
(20, 20, 'gv015', 'hashed_password_20', 'salt_20', TRUE, 'active'),
(21, 21, 'sv001', 'hashed_password_21', 'salt_21', TRUE, 'active'),
(22, 22, 'sv002', 'hashed_password_22', 'salt_22', TRUE, 'active'),
(23, 23, 'sv003', 'hashed_password_23', 'salt_23', TRUE, 'active'),
(24, 24, 'sv004', 'hashed_password_24', 'salt_24', TRUE, 'active'),
(25, 25, 'sv005', 'hashed_password_25', 'salt_25', TRUE, 'active'),
(26, 26, 'sv006', 'hashed_password_26', 'salt_26', TRUE, 'active'),
(27, 27, 'sv007', 'hashed_password_27', 'salt_27', TRUE, 'active'),
(28, 28, 'sv008', 'hashed_password_28', 'salt_28', TRUE, 'active'),
(29, 29, 'sv009', 'hashed_password_29', 'salt_29', TRUE, 'active'),
(30, 30, 'sv010', 'hashed_password_30', 'salt_30', TRUE, 'active'),
(31, 31, 'sv011', 'hashed_password_31', 'salt_31', TRUE, 'active'),
(32, 32, 'sv012', 'hashed_password_32', 'salt_32', TRUE, 'active'),
(33, 33, 'sv013', 'hashed_password_33', 'salt_33', TRUE, 'active'),
(34, 34, 'sv014', 'hashed_password_34', 'salt_34', TRUE, 'active'),
(35, 35, 'sv015', 'hashed_password_35', 'salt_35', TRUE, 'active'),
(36, 36, 'sv016', 'hashed_password_36', 'salt_36', TRUE, 'active'),
(37, 37, 'sv017', 'hashed_password_37', 'salt_37', TRUE, 'active'),
(38, 38, 'sv018', 'hashed_password_38', 'salt_38', TRUE, 'active'),
(39, 39, 'sv019', 'hashed_password_39', 'salt_39', TRUE, 'active'),
(40, 40, 'sv020', 'hashed_password_40', 'salt_40', TRUE, 'active'),
(41, 41, 'sv021', 'hashed_password_41', 'salt_41', TRUE, 'active'),
(42, 42, 'sv022', 'hashed_password_42', 'salt_42', TRUE, 'active'),
(43, 43, 'sv023', 'hashed_password_43', 'salt_43', TRUE, 'active'),
(44, 44, 'sv024', 'hashed_password_44', 'salt_44', TRUE, 'active'),
(45, 45, 'sv025', 'hashed_password_45', 'salt_45', TRUE, 'active'),
(46, 46, 'sv026', 'hashed_password_46', 'salt_46', TRUE, 'active'),
(47, 47, 'sv027', 'hashed_password_47', 'salt_47', TRUE, 'active'),
(48, 48, 'sv028', 'hashed_password_48', 'salt_48', TRUE, 'active'),
(49, 49, 'sv029', 'hashed_password_49', 'salt_49', TRUE, 'active'),
(50, 50, 'sv030', 'hashed_password_50', 'salt_50', TRUE, 'active');

-- Cập nhật sequence id_nguoi_dung
SELECT setval(pg_get_serial_sequence('nguoi_dung','id_nguoi_dung'), (SELECT MAX(id_nguoi_dung) FROM nguoi_dung));


-- =============================================
-- 3. BẢNG phien_dang_nhap (mẫu phiên)
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng phien_dang_nhap...';
END
$$;

INSERT INTO phien_dang_nhap (id_nguoi_dung, ma_phien, dia_chi_ip, thong_tin_trinh_duyet, ngay_het_han, hoat_dong_cuoi)
VALUES
(1, 'session_token_admin01_abc123', '192.168.1.101', 'Mozilla/5.0 Chrome/120.0', now() + interval '7 days', now()),
(21, 'session_token_sv001_def456', '192.168.1.201', 'Mozilla/5.0 Chrome/120.0', now() + interval '7 days', now()),
(22, 'session_token_sv002_ghi789', '192.168.1.202', 'Mozilla/5.0 Firefox/120.0', now() + interval '7 days', now()),
(6, 'session_token_gv001_jkl012', '192.168.1.106', 'Mozilla/5.0 Safari/17.0', now() + interval '7 days', now());

-- Cập nhật sequence id_phien nếu cần
SELECT setval(pg_get_serial_sequence('phien_dang_nhap','id_phien'), (SELECT COALESCE(MAX(id_phien),0) FROM phien_dang_nhap));


-- =============================================
-- 4. BẢNG nam_hoc
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng nam_hoc...';
END
$$;

INSERT INTO nam_hoc (id_nam_hoc, ngay_bat_dau, ngay_ket_thuc)
VALUES
(1, '2023-09-01', '2024-06-30'),
(2, '2024-09-01', '2025-06-30'),
(3, '2025-09-01', '2026-06-30');

SELECT setval(pg_get_serial_sequence('nam_hoc','id_nam_hoc'), (SELECT MAX(id_nam_hoc) FROM nam_hoc));


-- =============================================
-- 5. BẢNG lop
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng lop...';
END
$$;

INSERT INTO lop (id_lop, ma_lop, ten_lop, id_nam_hoc_bat_dau)
VALUES
(1, 'CNTT01-2023', 'Công Nghệ Thông Tin 01 - Khóa 2023', 1),
(2, 'CNTT02-2023', 'Công Nghệ Thông Tin 02 - Khóa 2023', 1),
(3, 'KHTN01-2023', 'Khoa Học Tự Nhiên 01 - Khóa 2023', 1),
(4, 'KT01-2023', 'Kinh Tế 01 - Khóa 2023', 1),
(5, 'KHXH01-2023', 'Khoa Học Xã Hội 01 - Khóa 2023', 1),
(6, 'CNTT01-2024', 'Công Nghệ Thông Tin 01 - Khóa 2024', 2),
(7, 'CNTT02-2024', 'Công Nghệ Thông Tin 02 - Khóa 2024', 2),
(8, 'KHTN01-2024', 'Khoa Học Tự Nhiên 01 - Khóa 2024', 2),
(9, 'KT01-2024', 'Kinh Tế 01 - Khóa 2024', 2),
(10, 'KThuat01-2024', 'Kỹ Thuật 01 - Khóa 2024', 2);

SELECT setval(pg_get_serial_sequence('lop','id_lop'), (SELECT MAX(id_lop) FROM lop));


-- =============================================
-- 6. BẢNG khoa
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng khoa...';
END
$$;

INSERT INTO khoa (id_khoa, ten_khoa, ma_khoa)
VALUES
(1, 'Khoa Công Nghệ Thông Tin', 'CNTT'),
(2, 'Khoa Khoa Học Tự Nhiên', 'KHTN'),
(3, 'Khoa Kinh Tế', 'KT'),
(4, 'Khoa Khoa Học Xã Hội', 'KHXH'),
(5, 'Khoa Kỹ Thuật', 'KThuat');

SELECT setval(pg_get_serial_sequence('khoa','id_khoa'), (SELECT MAX(id_khoa) FROM khoa));


-- =============================================
-- 7. BẢNG admin
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng admin...';
END
$$;

INSERT INTO admin (id_admin, id_nguoi, ma_admin, chuc_vu, trang_thai)
VALUES
(1, 1, 'ADM001', 'Giám đốc hệ thống', 'active'),
(2, 2, 'ADM002', 'Phó giám đốc', 'active'),
(3, 3, 'ADM003', 'Trưởng phòng đào tạo', 'active'),
(4, 4, 'ADM004', 'Trưởng phòng tài chính', 'active'),
(5, 5, 'ADM005', 'Trưởng phòng công nghệ', 'active');

SELECT setval(pg_get_serial_sequence('admin','id_admin'), (SELECT MAX(id_admin) FROM admin));


-- =============================================
-- 8. BẢNG giang_vien
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng giang_vien...';
END
$$;

INSERT INTO giang_vien (id_giang_vien, id_nguoi, ma_giang_vien, bang_cap, chuyen_mon, id_khoa, ngay_vao_lam, trang_thai)
VALUES
(1, 6, 'GV001', 'Tiến sĩ', 'Lập trình Web, Cơ sở dữ liệu', 1, '2015-09-01', 'active'),
(2, 7, 'GV002', 'Thạc sĩ', 'Trí tuệ nhân tạo, Machine Learning', 1, '2016-03-15', 'active'),
(3, 8, 'GV003', 'Tiến sĩ', 'Mạng máy tính, An ninh mạng', 1, '2014-08-20', 'active'),
(4, 9, 'GV004', 'Thạc sĩ', 'Toán học ứng dụng, Xác suất thống kê', 2, '2017-01-10', 'active'),
(5, 10, 'GV005', 'Tiến sĩ', 'Vật lý lý thuyết, Cơ học lượng tử', 2, '2013-09-01', 'active'),
(6, 11, 'GV006', 'Thạc sĩ', 'Hóa học hữu cơ, Hóa sinh', 2, '2018-02-15', 'active'),
(7, 12, 'GV007', 'Tiến sĩ', 'Kinh tế vi mô, Kinh tế vĩ mô', 3, '2015-07-01', 'active'),
(8, 13, 'GV008', 'Thạc sĩ', 'Quản trị kinh doanh, Marketing', 3, '2016-09-01', 'active'),
(9, 14, 'GV009', 'Tiến sĩ', 'Tài chính ngân hàng, Kế toán', 3, '2014-03-15', 'active'),
(10, 15, 'GV010', 'Thạc sĩ', 'Xã hội học, Tâm lý học xã hội', 4, '2017-08-01', 'active'),
(11, 16, 'GV011', 'Tiến sĩ', 'Lịch sử Việt Nam, Văn hóa học', 4, '2013-09-01', 'active'),
(12, 17, 'GV012', 'Thạc sĩ', 'Ngôn ngữ học, Văn học Việt Nam', 4, '2018-01-15', 'active'),
(13, 18, 'GV013', 'Tiến sĩ', 'Kỹ thuật điện, Tự động hóa', 5, '2015-02-01', 'active'),
(14, 19, 'GV014', 'Thạc sĩ', 'Kỹ thuật cơ khí, CAD/CAM', 5, '2016-07-15', 'active'),
(15, 20, 'GV015', 'Tiến sĩ', 'Kỹ thuật xây dựng, Kết cấu công trình', 5, '2014-09-01', 'active');

SELECT setval(pg_get_serial_sequence('giang_vien','id_giang_vien'), (SELECT MAX(id_giang_vien) FROM giang_vien));

-- Cập nhật trưởng khoa (các id_giang_vien đã tồn tại)
UPDATE khoa SET id_truong_khoa = 1 WHERE id_khoa = 1;
UPDATE khoa SET id_truong_khoa = 4 WHERE id_khoa = 2;
UPDATE khoa SET id_truong_khoa = 7 WHERE id_khoa = 3;
UPDATE khoa SET id_truong_khoa = 10 WHERE id_khoa = 4;
UPDATE khoa SET id_truong_khoa = 13 WHERE id_khoa = 5;


-- =============================================
-- 9. BẢNG sinh_vien (30 sinh viên)
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng sinh_vien...';
END
$$;

INSERT INTO sinh_vien (id_sinh_vien, id_nguoi, ma_sinh_vien, id_lop, so_tin_chi_tich_luy, trang_thai_hoc_tap, trang_thai)
VALUES
(1, 21, 'SV001', 1, 45, 'good_standing', 'active'),
(2, 22, 'SV002', 1, 42, 'good_standing', 'active'),
(3, 23, 'SV003', 1, 38, 'good_standing', 'active'),
(4, 24, 'SV004', 1, 40, 'good_standing', 'active'),
(5, 25, 'SV005', 1, 43, 'good_standing', 'active'),
(6, 26, 'SV006', 1, 35, 'good_standing', 'active'),
(7, 27, 'SV007', 2, 44, 'good_standing', 'active'),
(8, 28, 'SV008', 2, 41, 'good_standing', 'active'),
(9, 29, 'SV009', 2, 39, 'good_standing', 'active'),
(10, 30, 'SV010', 2, 37, 'good_standing', 'active'),
(11, 31, 'SV011', 2, 46, 'good_standing', 'active'),
(12, 32, 'SV012', 2, 40, 'good_standing', 'active'),
(13, 33, 'SV013', 3, 42, 'good_standing', 'active'),
(14, 34, 'SV014', 3, 38, 'good_standing', 'active'),
(15, 35, 'SV015', 3, 44, 'good_standing', 'active'),
(16, 36, 'SV016', 3, 41, 'good_standing', 'active'),
(17, 37, 'SV017', 3, 36, 'good_standing', 'active'),
(18, 38, 'SV018', 3, 39, 'good_standing', 'active'),
(19, 39, 'SV019', 4, 43, 'good_standing', 'active'),
(20, 40, 'SV020', 4, 40, 'good_standing', 'active'),
(21, 41, 'SV021', 4, 37, 'good_standing', 'active'),
(22, 42, 'SV022', 4, 42, 'good_standing', 'active'),
(23, 43, 'SV023', 4, 38, 'good_standing', 'active'),
(24, 44, 'SV024', 4, 41, 'good_standing', 'active'),
(25, 45, 'SV025', 5, 40, 'good_standing', 'active'),
(26, 46, 'SV026', 5, 39, 'good_standing', 'active'),
(27, 47, 'SV027', 5, 42, 'good_standing', 'active'),
(28, 48, 'SV028', 5, 37, 'good_standing', 'active'),
(29, 49, 'SV029', 5, 44, 'good_standing', 'active'),
(30, 50, 'SV030', 5, 41, 'good_standing', 'active');

SELECT setval(pg_get_serial_sequence('sinh_vien','id_sinh_vien'), (SELECT MAX(id_sinh_vien) FROM sinh_vien));


-- =============================================
-- 10. BẢNG mon_hoc (25 môn học)
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng mon_hoc...';
END
$$;

INSERT INTO mon_hoc (id_mon_hoc, ten_mon_hoc, ma_mon_hoc, so_tin_chi, gio_ly_thuyet, gio_thuc_hanh, id_khoa)
VALUES
(1, 'Lập trình căn bản', 'CNTT101', 3, 30, 30, 1),
(2, 'Cấu trúc dữ liệu và giải thuật', 'CNTT102', 4, 45, 15, 1),
(3, 'Cơ sở dữ liệu', 'CNTT201', 3, 30, 30, 1),
(4, 'Lập trình hướng đối tượng', 'CNTT202', 3, 30, 30, 1),
(5, 'Phát triển ứng dụng Web', 'CNTT301', 4, 30, 45, 1),
(6, 'Giải tích 1', 'KHTN101', 4, 60, 0, 2),
(7, 'Đại số tuyến tính', 'KHTN102', 3, 45, 0, 2),
(8, 'Vật lý đại cương 1', 'KHTN201', 3, 30, 30, 2),
(9, 'Hóa học đại cương', 'KHTN202', 3, 30, 30, 2),
(10, 'Xác suất thống kê', 'KHTN301', 3, 45, 0, 2),
(11, 'Kinh tế vi mô', 'KT101', 3, 45, 0, 3),
(12, 'Kinh tế vĩ mô', 'KT102', 3, 45, 0, 3),
(13, 'Nguyên lý kế toán', 'KT201', 3, 30, 30, 3),
(14, 'Quản trị học', 'KT202', 3, 45, 0, 3),
(15, 'Marketing căn bản', 'KT301', 3, 30, 15, 3),
(16, 'Triết học Mác - Lênin', 'KHXH101', 3, 45, 0, 4),
(17, 'Kinh tế chính trị Mác - Lênin', 'KHXH102', 2, 30, 0, 4),
(18, 'Chủ nghĩa xã hội khoa học', 'KHXH103', 2, 30, 0, 4),
(19, 'Lịch sử Đảng Cộng sản Việt Nam', 'KHXH201', 2, 30, 0, 4),
(20, 'Tư tưởng Hồ Chí Minh', 'KHXH202', 2, 30, 0, 4),
(21, 'Kỹ thuật điện cơ bản', 'KT101E', 3, 30, 30, 5),
(22, 'Vẽ kỹ thuật', 'KT102E', 2, 15, 30, 5),
(23, 'Cơ học kỹ thuật', 'KT201E', 4, 45, 15, 5),
(24, 'Kỹ thuật số', 'KT202E', 3, 30, 30, 5),
(25, 'Tự động hóa', 'KT301E', 4, 30, 45, 5);

SELECT setval(pg_get_serial_sequence('mon_hoc','id_mon_hoc'), (SELECT MAX(id_mon_hoc) FROM mon_hoc));


-- =============================================
-- 11. BẢNG mon_hoc_tien_quyet
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng mon_hoc_tien_quyet...';
END
$$;

INSERT INTO mon_hoc_tien_quyet (id_tien_quyet, id_mon_hoc, id_mon_hoc_can_truoc, diem_toi_thieu)
VALUES
(1, 2, 1, 5.0),
(2, 3, 1, 5.0),
(3, 4, 1, 5.0),
(4, 5, 3, 6.0),
(5, 5, 4, 6.0),
(6, 10, 6, 5.0),
(7, 13, 11, 5.0),
(8, 15, 14, 5.0),
(9, 23, 21, 5.0),
(10, 25, 24, 6.0);

SELECT setval(pg_get_serial_sequence('mon_hoc_tien_quyet','id_tien_quyet'), (SELECT MAX(id_tien_quyet) FROM mon_hoc_tien_quyet));


-- =============================================
-- 12. BẢNG hoc_ky
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng hoc_ky...';
END
$$;

INSERT INTO hoc_ky (id_hoc_ky, ten_hoc_ky, id_nam_hoc, loai_hoc_ky, ngay_bat_dau, ngay_ket_thuc, ngay_bat_dau_dang_ky, ngay_ket_thuc_dang_ky)
VALUES
(1, 'Học kỳ 1 năm 2023-2024', 1, 'chinh', '2023-09-01', '2024-01-15', '2023-08-15', '2023-08-31'),
(2, 'Học kỳ 2 năm 2023-2024', 1, 'chinh', '2024-01-20', '2024-06-30', '2024-01-05', '2024-01-19'),
(3, 'Học kỳ 1 năm 2024-2025', 2, 'chinh', '2024-09-01', '2025-01-15', '2024-08-15', '2024-08-31'),
(4, 'Học kỳ 2 năm 2024-2025', 2, 'chinh', '2025-01-20', '2025-06-30', '2025-01-05', '2025-01-19'),
(5, 'Học kỳ 1 năm 2025-2026', 3, 'chinh', '2025-09-01', '2026-01-15', '2025-08-15', '2025-08-31'),
(6, 'Học kỳ 2 năm 2025-2026', 3, 'chinh', '2026-01-20', '2026-06-30', '2026-01-05', '2026-01-19');

SELECT setval(pg_get_serial_sequence('hoc_ky','id_hoc_ky'), (SELECT MAX(id_hoc_ky) FROM hoc_ky));


-- =============================================
-- 13. BẢNG tuan (96 tuần)
-- =============================================
DO $$
DECLARE
    hk INT := 1;
    week INT;
    startDate DATE;
    weekStart DATE;
    weekEnd DATE;
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng tuan...';
    WHILE hk <= 6 LOOP
        SELECT ngay_bat_dau INTO startDate FROM hoc_ky WHERE id_hoc_ky = hk;
        week := 1;
        WHILE week <= 16 LOOP
            weekStart := startDate + (week - 1) * INTERVAL '7 days';
            weekEnd := weekStart + INTERVAL '6 days';
            INSERT INTO tuan (id_hoc_ky, thu_tu_tuan, ngay_bat_dau, ngay_ket_thuc)
            VALUES (hk, week, weekStart::date, (weekEnd::date));
            week := week + 1;
        END LOOP;
        hk := hk + 1;
    END LOOP;
END;
$$;

SELECT setval(pg_get_serial_sequence('tuan','id_tuan'), (SELECT MAX(id_tuan) FROM tuan));


-- =============================================
-- 14. BẢNG ngay (672 ngày)
-- =============================================
DO $$
DECLARE
    rec RECORD;
    dayNum INT;
    dayDate DATE;
    dayName TEXT;
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng ngay...';
    FOR rec IN SELECT id_tuan, ngay_bat_dau FROM tuan LOOP
        dayNum := 1;
        WHILE dayNum <= 7 LOOP
            dayDate := rec.ngay_bat_dau + (dayNum - 1) * INTERVAL '1 day';
            dayName := CASE dayNum
                WHEN 1 THEN 'Thứ Hai'
                WHEN 2 THEN 'Thứ Ba'
                WHEN 3 THEN 'Thứ Tư'
                WHEN 4 THEN 'Thứ Năm'
                WHEN 5 THEN 'Thứ Sáu'
                WHEN 6 THEN 'Thứ Bảy'
                ELSE 'Chủ Nhật'
            END;
            INSERT INTO ngay (id_tuan, thu_tu_ngay, ngay_thang, ten_ngay)
            VALUES (rec.id_tuan, dayNum, dayDate::date, dayName);
            dayNum := dayNum + 1;
        END LOOP;
    END LOOP;
END;
$$;

SELECT setval(pg_get_serial_sequence('ngay','id_ngay'), (SELECT MAX(id_ngay) FROM ngay));


-- =============================================
-- 15. BẢNG toa_nha (3 tòa nhà)
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng toa_nha...';
END
$$;

INSERT INTO toa_nha (id_toa_nha, ten_toa_nha, ma_toa_nha, dia_chi)
VALUES
(1, 'Tòa Nhà A - Khoa Học Tự Nhiên', 'TNA', '227 Nguyễn Văn Cừ, Quận 5, TP.HCM'),
(2, 'Tòa Nhà B - Công Nghệ Thông Tin', 'TNB', '268 Lý Thường Kiệt, Quận 10, TP.HCM'),
(3, 'Tòa Nhà C - Khoa Học Xã Hội', 'TNC', '273 An Dương Vương, Quận 5, TP.HCM');

SELECT setval(pg_get_serial_sequence('toa_nha','id_toa_nha'), (SELECT MAX(id_toa_nha) FROM toa_nha));


-- =============================================
-- 16. BẢNG phong (20 phòng)
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng phong...';
END
$$;

INSERT INTO phong (id_phong, ma_phong, ten_phong, suc_chua, loai, id_toa_nha)
VALUES
(1, 'A101', 'Phòng học A101', 50, 'phong_hoc', 1),
(2, 'A102', 'Phòng học A102', 50, 'phong_hoc', 1),
(3, 'A103', 'Phòng học A103', 40, 'phong_hoc', 1),
(4, 'A201', 'Phòng thực hành Vật lý A201', 30, 'phong_thuc_hanh', 1),
(5, 'A202', 'Phòng thực hành Hóa học A202', 30, 'phong_thuc_hanh', 1),
(6, 'A301', 'Giảng đường A301', 150, 'giang_duong', 1),
(7, 'A302', 'Giảng đường A302', 120, 'giang_duong', 1),
(8, 'B101', 'Phòng máy B101', 40, 'phong_may', 2),
(9, 'B102', 'Phòng máy B102', 40, 'phong_may', 2),
(10, 'B103', 'Phòng máy B103', 35, 'phong_may', 2),
(11, 'B201', 'Phòng học B201', 45, 'phong_hoc', 2),
(12, 'B202', 'Phòng học B202', 45, 'phong_hoc', 2),
(13, 'B203', 'Phòng học B203', 40, 'phong_hoc', 2),
(14, 'B301', 'Giảng đường B301', 200, 'giang_duong', 2),
(15, 'C101', 'Phòng học C101', 50, 'phong_hoc', 3),
(16, 'C102', 'Phòng học C102', 50, 'phong_hoc', 3),
(17, 'C103', 'Phòng học C103', 45, 'phong_hoc', 3),
(18, 'C201', 'Phòng học C201', 40, 'phong_hoc', 3),
(19, 'C301', 'Giảng đường C301', 180, 'giang_duong', 3),
(20, 'C302', 'Giảng đường C302', 150, 'giang_duong', 3);

SELECT setval(pg_get_serial_sequence('phong','id_phong'), (SELECT MAX(id_phong) FROM phong));


-- =============================================
-- 17. BẢNG khoa_hoc (30 khóa học)
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng khoa_hoc...';
END
$$;

INSERT INTO khoa_hoc (id_khoa_hoc, id_mon_hoc, id_giang_vien, id_lop, id_hoc_ky, so_sinh_vien_toi_da, trang_thai)
VALUES
(1, 1, 1, 1, 1, 40, 'completed'),
(2, 6, 4, 3, 1, 45, 'completed'),
(3, 11, 7, 4, 1, 40, 'completed'),
(4, 16, 10, 5, 1, 50, 'completed'),
(5, 21, 13, 10, 1, 35, 'completed'),
(6, 2, 1, 1, 2, 40, 'completed'),
(7, 3, 1, 2, 2, 35, 'completed'),
(8, 7, 4, 3, 2, 40, 'completed'),
(9, 12, 7, 4, 2, 40, 'completed'),
(10, 17, 10, 5, 2, 50, 'completed'),
(11, 1, 2, 6, 3, 40, 'active'),
(12, 4, 1, 1, 3, 35, 'active'),
(13, 8, 5, 8, 3, 35, 'active'),
(14, 13, 9, 9, 3, 40, 'active'),
(15, 22, 14, 10, 3, 30, 'active'),
(16, 5, 2, 1, 4, 35, 'active'),
(17, 3, 3, 7, 4, 40, 'active'),
(18, 9, 6, 8, 4, 35, 'active'),
(19, 14, 8, 9, 4, 40, 'active'),
(20, 23, 13, 10, 4, 35, 'active'),
(21, 10, 4, 3, 3, 40, 'active'),
(22, 15, 8, 4, 3, 40, 'active'),
(23, 18, 11, 5, 3, 50, 'active'),
(24, 19, 11, 5, 4, 50, 'active'),
(25, 24, 14, 10, 3, 30, 'active'),
(26, 25, 13, 10, 4, 30, 'active'),
(27, 2, 2, 6, 3, 40, 'active'),
(28, 4, 2, 7, 4, 35, 'active'),
(29, 6, 5, 8, 3, 45, 'active'),
(30, 7, 5, 8, 4, 40, 'active');

SELECT setval(pg_get_serial_sequence('khoa_hoc','id_khoa_hoc'), (SELECT MAX(id_khoa_hoc) FROM khoa_hoc));


-- =============================================
-- 18. BẢNG sinh_vien_khoa_hoc (Đăng ký khóa học)
-- =============================================
DO $$
DECLARE
    sv RECORD;
    svkh_id INT := 1;
    random_val DOUBLE PRECISION;
    kh_id INT;
    lop_id INT;
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng sinh_vien_khoa_hoc...';

    -- Bypass triggers that might prevent inserts (bằng cách set session_replication_role)
    PERFORM set_config('session_replication_role', 'replica', true);

    -- Sinh viên lớp CNTT01-2023 (id_lop = 1)
    FOR sv IN SELECT id_sinh_vien FROM sinh_vien WHERE id_lop = 1 LOOP
        random_val := random();
        INSERT INTO sinh_vien_khoa_hoc (id_dang_ky, id_sinh_vien, id_khoa_hoc, ngay_dang_ky, trang_thai, diem_chuyen_can, diem_giua_ky, diem_cuoi_ky)
        VALUES (svkh_id, sv.id_sinh_vien, 1, '2023-08-20', 'completed', 7.0 + (random_val * 3.0), 6.0 + (random_val * 4.0), 6.0 + (random_val * 4.0));
        svkh_id := svkh_id + 1;

        random_val := random();
        INSERT INTO sinh_vien_khoa_hoc (id_dang_ky, id_sinh_vien, id_khoa_hoc, ngay_dang_ky, trang_thai, diem_chuyen_can, diem_giua_ky, diem_cuoi_ky)
        VALUES (svkh_id, sv.id_sinh_vien, 6, '2024-01-10', 'completed', 7.0 + (random_val * 3.0), 6.0 + (random_val * 4.0), 6.0 + (random_val * 4.0));
        svkh_id := svkh_id + 1;

        INSERT INTO sinh_vien_khoa_hoc (id_dang_ky, id_sinh_vien, id_khoa_hoc, ngay_dang_ky, trang_thai)
        VALUES (svkh_id, sv.id_sinh_vien, 12, '2024-08-20', 'registered');
        svkh_id := svkh_id + 1;
    END LOOP;

    -- Sinh viên lớp CNTT02-2023 (id_lop = 2)
    FOR sv IN SELECT id_sinh_vien FROM sinh_vien WHERE id_lop = 2 LOOP
        random_val := random();
        INSERT INTO sinh_vien_khoa_hoc (id_dang_ky, id_sinh_vien, id_khoa_hoc, ngay_dang_ky, trang_thai, diem_chuyen_can, diem_giua_ky, diem_cuoi_ky)
        VALUES (svkh_id, sv.id_sinh_vien, 7, '2024-01-10', 'completed', 7.0 + (random_val * 3.0), 6.0 + (random_val * 4.0), 6.0 + (random_val * 4.0));
        svkh_id := svkh_id + 1;
    END LOOP;

    -- Các lớp khác (lop 3..5)
    lop_id := 3;
    WHILE lop_id <= 5 LOOP
        FOR sv IN SELECT id_sinh_vien FROM sinh_vien WHERE id_lop = lop_id LOOP
            SELECT id_khoa_hoc INTO kh_id FROM khoa_hoc WHERE id_lop = lop_id AND id_hoc_ky = 1 LIMIT 1;
            IF kh_id IS NOT NULL THEN
                random_val := random();
                INSERT INTO sinh_vien_khoa_hoc (id_dang_ky, id_sinh_vien, id_khoa_hoc, ngay_dang_ky, trang_thai, diem_chuyen_can, diem_giua_ky, diem_cuoi_ky)
                VALUES (svkh_id, sv.id_sinh_vien, kh_id, '2023-08-20', 'completed', 7.0 + (random_val * 3.0), 6.0 + (random_val * 4.0), 6.0 + (random_val * 4.0));
                svkh_id := svkh_id + 1;
            END IF;
        END LOOP;
        lop_id := lop_id + 1;
    END LOOP;

    -- cập nhật sequence
    PERFORM set_config('session_replication_role', 'origin', true);
END;
$$;

SELECT setval(pg_get_serial_sequence('sinh_vien_khoa_hoc','id_dang_ky'), (SELECT COALESCE(MAX(id_dang_ky),0) FROM sinh_vien_khoa_hoc));


-- =============================================
-- 19. BẢNG lich_hoc (Lịch học)
-- =============================================
DO $$
DECLARE
    kh_rec RECORD;
    tuan_id INT;
    ngay_rec RECORD;
    counter INT;
    lh_id INT := 1;
    phong_id INT;
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng lich_hoc...';

    -- Bypass triggers if any
    PERFORM set_config('session_replication_role', 'replica', true);

    FOR kh_rec IN SELECT id_khoa_hoc, id_hoc_ky FROM khoa_hoc WHERE trang_thai = 'active' LOOP
        SELECT id_tuan INTO tuan_id FROM tuan WHERE id_hoc_ky = kh_rec.id_hoc_ky ORDER BY thu_tu_tuan LIMIT 1;
        IF tuan_id IS NULL THEN
            CONTINUE;
        END IF;

        counter := 0;
        FOR ngay_rec IN SELECT id_ngay FROM ngay WHERE id_tuan = tuan_id AND thu_tu_ngay IN (1,3) LOOP
            EXIT WHEN counter >= 2;
            SELECT id_phong INTO phong_id FROM phong ORDER BY random() LIMIT 1;
            INSERT INTO lich_hoc (id_lich_hoc, id_khoa_hoc, id_ngay, tiet_bat_dau, tiet_ket_thuc, id_phong)
            VALUES (lh_id, kh_rec.id_khoa_hoc, ngay_rec.id_ngay, 1, 3, phong_id);
            lh_id := lh_id + 1;
            counter := counter + 1;
        END LOOP;
    END LOOP;

    PERFORM set_config('session_replication_role', 'origin', true);
END;
$$;

SELECT setval(pg_get_serial_sequence('lich_hoc','id_lich_hoc'), (SELECT COALESCE(MAX(id_lich_hoc),0) FROM lich_hoc));


-- =============================================
-- 20. BẢNG dat_phong (Đặt phòng)
-- =============================================
DO $$
DECLARE
    dp_id INT := 1;
    nguoi_dat_id INT;
    phong_id_dp INT;
    muc_dich TEXT;
    trang_thai TEXT;
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng dat_phong...';
    WHILE dp_id <= 20 LOOP
        SELECT id_nguoi_dung INTO nguoi_dat_id FROM nguoi_dung WHERE id_nguoi_dung BETWEEN 6 AND 20 ORDER BY random() LIMIT 1;
        SELECT id_phong INTO phong_id_dp FROM phong ORDER BY random() LIMIT 1;

        muc_dich := CASE (dp_id % 4)
            WHEN 0 THEN 'Họp khoa'
            WHEN 1 THEN 'Seminar nghiên cứu'
            WHEN 2 THEN 'Thi vấn đáp'
            ELSE 'Bảo vệ đồ án'
        END;

        trang_thai := CASE (dp_id % 3)
            WHEN 0 THEN 'approved'
            WHEN 1 THEN 'pending'
            ELSE 'approved'
        END;

        INSERT INTO dat_phong (id_dat_phong, id_phong, ngay_dat, tiet_bat_dau, tiet_ket_thuc, muc_dich, nguoi_dat, trang_thai, ngay_tao)
        VALUES (dp_id, phong_id_dp, (DATE '2024-09-01' + (dp_id * INTERVAL '1 day'))::date, 6, 9, muc_dich, nguoi_dat_id, trang_thai, now());

        dp_id := dp_id + 1;
    END LOOP;
END;
$$;

SELECT setval(pg_get_serial_sequence('dat_phong','id_dat_phong'), (SELECT COALESCE(MAX(id_dat_phong),0) FROM dat_phong));


-- =============================================
-- 21. BẢNG hoc_phi (Học phí)
-- =============================================
DO $$
DECLARE
    hp_id INT := 1;
    sv_id_hp INT;
    hoc_ky_id_hp INT;
    so_tien NUMERIC;
    han_dong DATE;
    da_dong BOOLEAN;
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng hoc_phi...';
    WHILE hp_id <= 180 LOOP
        sv_id_hp := ((hp_id - 1) % 30) + 1;
        hoc_ky_id_hp := ((hp_id - 1) / 30)::int + 1;

        so_tien := CASE WHEN hoc_ky_id_hp IN (1,3,5) THEN 15000000 ELSE 12000000 END;
        han_dong := (SELECT ngay_bat_dau FROM hoc_ky WHERE id_hoc_ky = hoc_ky_id_hp) + INTERVAL '1 month';
        da_dong := CASE WHEN hoc_ky_id_hp <= 2 THEN TRUE WHEN (hp_id % 3 = 0) THEN TRUE ELSE FALSE END;

        INSERT INTO hoc_phi (id_hoc_phi, id_sinh_vien, id_hoc_ky, so_tien, han_dong, da_dong, ngay_tao)
        VALUES (hp_id, sv_id_hp, hoc_ky_id_hp, so_tien, (han_dong::date), da_dong, (SELECT ngay_bat_dau FROM hoc_ky WHERE id_hoc_ky = hoc_ky_id_hp) - INTERVAL '30 days');

        hp_id := hp_id + 1;
    END LOOP;
END;
$$;

SELECT setval(pg_get_serial_sequence('hoc_phi','id_hoc_phi'), (SELECT COALESCE(MAX(id_hoc_phi),0) FROM hoc_phi));


-- =============================================
-- 22. BẢNG thanh_toan (Thanh toán)
-- =============================================
DO $$
DECLARE
    tt_id INT := 1;
    hp_rec RECORD;
    phuong_thuc TEXT;
    so_bien_lai TEXT;
    ngay_thanh_toan DATE;
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng thanh_toan...';

    FOR hp_rec IN SELECT id_hoc_phi, so_tien, id_hoc_ky FROM hoc_phi WHERE da_dong = TRUE LOOP
        phuong_thuc := CASE (tt_id % 3)
            WHEN 0 THEN 'Chuyển khoản'
            WHEN 1 THEN 'Tiền mặt'
            ELSE 'Ví điện tử'
        END;
        so_bien_lai := 'BL' || lpad(tt_id::text, 6, '0');
        ngay_thanh_toan := (SELECT ngay_bat_dau FROM hoc_ky WHERE id_hoc_ky = hp_rec.id_hoc_ky) - INTERVAL '15 days';
        INSERT INTO thanh_toan (id_thanh_toan, id_hoc_phi, so_tien, ngay_thanh_toan, phuong_thuc_thanh_toan, so_bien_lai, trang_thai, ngay_tao)
        VALUES (tt_id, hp_rec.id_hoc_phi, hp_rec.so_tien, ngay_thanh_toan::date, phuong_thuc, so_bien_lai, 'completed', now());
        tt_id := tt_id + 1;
    END LOOP;
END;
$$;

SELECT setval(pg_get_serial_sequence('thanh_toan','id_thanh_toan'), (SELECT COALESCE(MAX(id_thanh_toan),0) FROM thanh_toan));


-- =============================================
-- 23. BẢNG tai_lieu (Tài liệu)
-- =============================================
DO $$
DECLARE
    tl_id INT := 1;
    khoa_hoc_id_tl INT;
    giang_vien_id_tl INT;
    nguoi_id_tl INT;
    nguoi_dung_id_tl INT;
    ten_file TEXT;
    duong_dan TEXT;
    loai_file TEXT;
    kich_thuoc BIGINT;
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng tai_lieu...';

    WHILE tl_id <= 60 LOOP
        khoa_hoc_id_tl := ((tl_id - 1) % 30) + 1;
        SELECT id_giang_vien INTO giang_vien_id_tl FROM khoa_hoc WHERE id_khoa_hoc = khoa_hoc_id_tl LIMIT 1;
        SELECT id_nguoi INTO nguoi_id_tl FROM giang_vien WHERE id_giang_vien = giang_vien_id_tl LIMIT 1;
        SELECT id_nguoi_dung INTO nguoi_dung_id_tl FROM nguoi_dung WHERE id_nguoi = nguoi_id_tl LIMIT 1;

        CASE (tl_id % 4)
            WHEN 0 THEN
                ten_file := 'Bài giảng tuần ' || ((tl_id % 10) + 1)::text || '.pdf';
                loai_file := 'pdf';
                duong_dan := '/uploads/courses/' || khoa_hoc_id_tl::text || '/' || tl_id::text || '.pdf';
            WHEN 1 THEN
                ten_file := 'Bài tập ' || ((tl_id % 10) + 1)::text || '.docx';
                loai_file := 'docx';
                duong_dan := '/uploads/courses/' || khoa_hoc_id_tl::text || '/' || tl_id::text || '.docx';
            WHEN 2 THEN
                ten_file := 'Slide bài giảng ' || ((tl_id % 10) + 1)::text || '.pptx';
                loai_file := 'pptx';
                duong_dan := '/uploads/courses/' || khoa_hoc_id_tl::text || '/' || tl_id::text || '.pptx';
            ELSE
                ten_file := 'Tài liệu tham khảo ' || ((tl_id % 10) + 1)::text || '.pdf';
                loai_file := 'pdf';
                duong_dan := '/uploads/courses/' || khoa_hoc_id_tl::text || '/' || tl_id::text || '.pdf';
        END CASE;

        kich_thuoc := floor(random() * 5000000)::bigint + 100000;

        INSERT INTO tai_lieu (id_tai_lieu, id_khoa_hoc, ten_file, duong_dan_file, loai_file, kich_thuoc_file, nguoi_upload, mo_ta, ngay_tao)
        VALUES (tl_id, khoa_hoc_id_tl, ten_file, duong_dan, loai_file, kich_thuoc, nguoi_dung_id_tl, 'Tài liệu học tập môn học', (now() - ((tl_id % 30) * INTERVAL '1 day')));

        tl_id := tl_id + 1;
    END LOOP;
END;
$$;

SELECT setval(pg_get_serial_sequence('tai_lieu','id_tai_lieu'), (SELECT COALESCE(MAX(id_tai_lieu),0) FROM tai_lieu));


-- =============================================
-- 24. BẢNG thong_bao (Thông báo)
-- =============================================
DO $$
DECLARE
    tb_id INT := 1;
    nguoi_gui_id INT;
    nguoi_nhan_id INT;
    loai_thong_bao TEXT;
    tieu_de TEXT;
    noi_dung TEXT;
    da_doc BOOLEAN;
BEGIN
    RAISE NOTICE 'Đang chèn dữ liệu bảng thong_bao...';

    -- Tạo thông báo từ admin đến sinh viên (50)
    WHILE tb_id <= 50 LOOP
        SELECT id_nguoi_dung INTO nguoi_gui_id FROM nguoi_dung WHERE id_nguoi_dung BETWEEN 1 AND 5 ORDER BY random() LIMIT 1;
        SELECT id_nguoi_dung INTO nguoi_nhan_id FROM nguoi_dung WHERE id_nguoi_dung BETWEEN 21 AND 50 ORDER BY random() LIMIT 1;

        CASE (tb_id % 5)
            WHEN 0 THEN loai_thong_bao := 'diem_so';
            WHEN 1 THEN loai_thong_bao := 'hoc_phi';
            WHEN 2 THEN loai_thong_bao := 'lich_hoc';
            WHEN 3 THEN loai_thong_bao := 'thong_bao_chung';
            ELSE loai_thong_bao := 'he_thong';
        END CASE;

        CASE (tb_id % 5)
            WHEN 0 THEN tieu_de := 'Thông báo điểm thi';
            WHEN 1 THEN tieu_de := 'Nhắc nhở đóng học phí';
            WHEN 2 THEN tieu_de := 'Thay đổi lịch học';
            WHEN 3 THEN tieu_de := 'Thông báo chung từ nhà trường';
            ELSE tieu_de := 'Thông báo hệ thống';
        END CASE;

        CASE (tb_id % 5)
            WHEN 0 THEN noi_dung := 'Điểm thi học kỳ của bạn đã được cập nhật. Vui lòng kiểm tra.';
            WHEN 1 THEN noi_dung := 'Học phí học kỳ sắp đến hạn. Vui lòng thanh toán trước ngày ' || to_char((now() + INTERVAL '7 days')::date, 'DD/MM/YYYY');
            WHEN 2 THEN noi_dung := 'Lịch học môn XYZ đã được thay đổi. Vui lòng kiểm tra lịch mới.';
            WHEN 3 THEN noi_dung := 'Nhà trường thông báo về lịch nghỉ lễ sắp tới.';
            ELSE noi_dung := 'Hệ thống sẽ bảo trì vào cuối tuần này.';
        END CASE;

        da_doc := CASE WHEN (tb_id % 3 = 0) THEN TRUE ELSE FALSE END;

        INSERT INTO thong_bao (id_thong_bao, id_nguoi_gui, id_nguoi_nhan, loai_thong_bao, tieu_de, noi_dung, da_doc, ngay_tao)
        VALUES (tb_id, nguoi_gui_id, nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, da_doc, now() - ((tb_id % 30) * INTERVAL '1 day'));

        tb_id := tb_id + 1;
    END LOOP;

    -- Tạo thông báo từ giảng viên đến sinh viên (50 tiếp theo)
    WHILE tb_id <= 100 LOOP
        SELECT id_nguoi_dung INTO nguoi_gui_id FROM nguoi_dung WHERE id_nguoi_dung BETWEEN 6 AND 20 ORDER BY random() LIMIT 1;
        SELECT id_nguoi_dung INTO nguoi_nhan_id FROM nguoi_dung WHERE id_nguoi_dung BETWEEN 21 AND 50 ORDER BY random() LIMIT 1;

        CASE (tb_id % 3)
            WHEN 0 THEN loai_thong_bao := 'diem_so';
            WHEN 1 THEN loai_thong_bao := 'lich_hoc';
            ELSE loai_thong_bao := 'thong_bao_chung';
        END CASE;

        CASE (tb_id % 3)
            WHEN 0 THEN tieu_de := 'Thông báo điểm bài kiểm tra';
            WHEN 1 THEN tieu_de := 'Thông báo lịch thi';
            ELSE tieu_de := 'Thông báo về đồ án môn học';
        END CASE;

        noi_dung := 'Nội dung thông báo từ giảng viên.';
        da_doc := CASE WHEN (tb_id % 2 = 0) THEN TRUE ELSE FALSE END;

        INSERT INTO thong_bao (id_thong_bao, id_nguoi_gui, id_nguoi_nhan, loai_thong_bao, tieu_de, noi_dung, da_doc, ngay_tao)
        VALUES (tb_id, nguoi_gui_id, nguoi_nhan_id, loai_thong_bao, tieu_de, noi_dung, da_doc, now() - ((tb_id % 20) * INTERVAL '1 day'));

        tb_id := tb_id + 1;
    END LOOP;
END;
$$;

SELECT setval(pg_get_serial_sequence('thong_bao','id_thong_bao'), (SELECT COALESCE(MAX(id_thong_bao),0) FROM thong_bao));


-- Kết thúc
DO $$ BEGIN RAISE NOTICE '=========================================='; RAISE NOTICE 'Hoàn thành chèn dữ liệu mẫu (Phần 2)!'; RAISE NOTICE '=========================================='; RAISE NOTICE '- Bảng sinh_vien_khoa_hoc: ~100+ bản ghi'; RAISE NOTICE '- Bảng lich_hoc: ~60+ bản ghi'; RAISE NOTICE '- Bảng dat_phong: 20 bản ghi'; RAISE NOTICE '- Bảng hoc_phi: 180 bản ghi'; RAISE NOTICE '- Bảng thanh_toan: ~120+ bản ghi'; RAISE NOTICE '- Bảng tai_lieu: 60 bản ghi'; RAISE NOTICE '- Bảng thong_bao: 100 bản ghi'; RAISE NOTICE '=========================================='; END $$;
