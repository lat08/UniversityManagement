-- =============================================
-- HỆ THỐNG QUẢN LÝ ĐẠI HỌC
-- PostgreSQL Implementation - Phiên bản Tiếng Việt
-- =============================================

-- Tạo cơ sở dữ liệu (chạy lệnh này ngoài psql hoặc trong pgAdmin)
-- CREATE DATABASE university_management;
-- \c university_management;

-- =============================================
-- BẢNG NGƯỜI DÙNG & XÁC THỰC
-- =============================================

CREATE TABLE nguoi (
    id_nguoi SERIAL PRIMARY KEY,
    ho_ten VARCHAR(200) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh VARCHAR(10) CHECK (gioi_tinh IN ('nam', 'nu')),
    email VARCHAR(255) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),
    dia_chi VARCHAR(500),
    anh_dai_dien VARCHAR(500),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa TIMESTAMP NULL
);

CREATE TABLE nguoi_dung (
    id_nguoi_dung SERIAL PRIMARY KEY,
    id_nguoi INT NOT NULL UNIQUE REFERENCES nguoi(id_nguoi),
    ten_dang_nhap VARCHAR(100) NOT NULL UNIQUE,
    mat_khau_hash VARCHAR(255) NOT NULL,
    mat_khau_salt VARCHAR(255) NOT NULL,
    email_da_xac_thuc BOOLEAN DEFAULT FALSE,
    ma_xac_thuc_email VARCHAR(255),
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (trang_thai IN ('active', 'inactive', 'suspended')),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa TIMESTAMP NULL
);

CREATE TABLE phien_dang_nhap (
    id_phien SERIAL PRIMARY KEY,
    id_nguoi_dung INT NOT NULL REFERENCES nguoi_dung(id_nguoi_dung),
    ma_phien VARCHAR(255) NOT NULL UNIQUE,
    dia_chi_ip VARCHAR(45) NOT NULL,
    thong_tin_trinh_duyet VARCHAR(500),
    la_thiet_bi_moi BOOLEAN DEFAULT FALSE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_het_han TIMESTAMP NOT NULL,
    hoat_dong_cuoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CẤU TRÚC HỌC THUẬT
-- =============================================

CREATE TABLE nam_hoc (
    id_nam_hoc SERIAL PRIMARY KEY,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    ngay_xoa TIMESTAMP NULL
);

CREATE TABLE lop (
    id_lop SERIAL PRIMARY KEY,
    ma_lop VARCHAR(50) NOT NULL UNIQUE,
    ten_lop VARCHAR(200) NOT NULL,
    id_nam_hoc_bat_dau INT NOT NULL REFERENCES nam_hoc(id_nam_hoc),
    id_nam_hoc_ket_thuc INT REFERENCES nam_hoc(id_nam_hoc),
    ngay_xoa TIMESTAMP NULL
);

CREATE TABLE khoa (
    id_khoa SERIAL PRIMARY KEY,
    ten_khoa VARCHAR(200) NOT NULL,
    ma_khoa VARCHAR(50) NOT NULL UNIQUE,
    id_truong_khoa INT NULL,
    ngay_xoa TIMESTAMP NULL
);

-- =============================================
-- VAI TRÒ
-- =============================================

CREATE TABLE admin (
    id_admin SERIAL PRIMARY KEY,
    id_nguoi INT NOT NULL UNIQUE REFERENCES nguoi(id_nguoi),
    ma_admin VARCHAR(50) NOT NULL UNIQUE,
    chuc_vu VARCHAR(200),
    trang_thai VARCHAR(20) DEFAULT 'active' CHECK (trang_thai IN ('active', 'inactive')),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa TIMESTAMP NULL
);

CREATE TABLE giang_vien (
    id_giang_vien SERIAL PRIMARY KEY,
    id_nguoi INT NOT NULL UNIQUE REFERENCES nguoi(id_nguoi),
    ma_giang_vien VARCHAR(50) NOT NULL UNIQUE,
    bang_cap VARCHAR(200),
    chuyen_mon VARCHAR(500),
    id_khoa INT NOT NULL REFERENCES khoa(id_khoa),
    ngay_vao_lam DATE,
    trang_thai VARCHAR(20) DEFAULT 'active' CHECK (trang_thai IN ('active', 'inactive', 'retired')),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa TIMESTAMP NULL
);

ALTER TABLE khoa ADD CONSTRAINT fk_truong_khoa FOREIGN KEY (id_truong_khoa) REFERENCES giang_vien(id_giang_vien);

CREATE TABLE sinh_vien (
    id_sinh_vien SERIAL PRIMARY KEY,
    id_nguoi INT NOT NULL UNIQUE REFERENCES nguoi(id_nguoi),
    ma_sinh_vien VARCHAR(50) NOT NULL UNIQUE,
    id_lop INT REFERENCES lop(id_lop),
    so_tin_chi_tich_luy INT DEFAULT 0 CHECK (so_tin_chi_tich_luy >= 0),
    trang_thai_hoc_tap VARCHAR(20) DEFAULT 'good_standing' CHECK (trang_thai_hoc_tap IN ('good_standing', 'probation', 'suspended')),
    trang_thai VARCHAR(20) DEFAULT 'active' CHECK (trang_thai IN ('active', 'inactive', 'graduated', 'dropped_out')),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa TIMESTAMP NULL
);

-- =============================================
-- MÔN HỌC & KHÓA HỌC
-- =============================================

CREATE TABLE mon_hoc (
    id_mon_hoc SERIAL PRIMARY KEY,
    ten_mon_hoc VARCHAR(200) NOT NULL,
    ma_mon_hoc VARCHAR(50) NOT NULL UNIQUE,
    so_tin_chi INT NOT NULL CHECK (so_tin_chi > 0),
    gio_ly_thuyet INT DEFAULT 0,
    gio_thuc_hanh INT DEFAULT 0,
    id_khoa INT NOT NULL REFERENCES khoa(id_khoa),
    ngay_xoa TIMESTAMP NULL
);

CREATE TABLE mon_hoc_tien_quyet (
    id_tien_quyet SERIAL PRIMARY KEY,
    id_mon_hoc INT NOT NULL REFERENCES mon_hoc(id_mon_hoc),
    id_mon_hoc_can_truoc INT NOT NULL REFERENCES mon_hoc(id_mon_hoc),
    diem_toi_thieu NUMERIC(4,2) NOT NULL CHECK (diem_toi_thieu BETWEEN 0 AND 10),
    UNIQUE (id_mon_hoc, id_mon_hoc_can_truoc)
);

-- =============================================
-- QUẢN LÝ LỊCH TRÌNH
-- =============================================

CREATE TABLE hoc_ky (
    id_hoc_ky SERIAL PRIMARY KEY,
    ten_hoc_ky VARCHAR(100) NOT NULL,
    id_nam_hoc INT NOT NULL REFERENCES nam_hoc(id_nam_hoc),
    loai_hoc_ky VARCHAR(20) NOT NULL CHECK (loai_hoc_ky IN ('chinh', 'phu', 'he')),
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    ngay_bat_dau_dang_ky DATE NOT NULL,
    ngay_ket_thuc_dang_ky DATE NOT NULL,
    ngay_xoa TIMESTAMP NULL
);

CREATE TABLE tuan (
    id_tuan SERIAL PRIMARY KEY,
    id_hoc_ky INT NOT NULL REFERENCES hoc_ky(id_hoc_ky),
    thu_tu_tuan INT NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    UNIQUE (id_hoc_ky, thu_tu_tuan)
);

CREATE TABLE ngay (
    id_ngay SERIAL PRIMARY KEY,
    id_tuan INT NOT NULL REFERENCES tuan(id_tuan),
    thu_tu_ngay INT NOT NULL CHECK (thu_tu_ngay BETWEEN 1 AND 7),
    ngay_thang DATE NOT NULL,
    ten_ngay VARCHAR(20) NOT NULL,
    UNIQUE (id_tuan, thu_tu_ngay)
);

-- =============================================
-- KHÓA HỌC & ĐĂNG KÝ
-- =============================================

CREATE TABLE khoa_hoc (
    id_khoa_hoc SERIAL PRIMARY KEY,
    id_mon_hoc INT NOT NULL REFERENCES mon_hoc(id_mon_hoc),
    id_giang_vien INT NOT NULL REFERENCES giang_vien(id_giang_vien),
    id_lop INT NOT NULL REFERENCES lop(id_lop),
    id_hoc_ky INT NOT NULL REFERENCES hoc_ky(id_hoc_ky),
    so_sinh_vien_toi_da INT NOT NULL CHECK (so_sinh_vien_toi_da > 0),
    trang_thai VARCHAR(20) DEFAULT 'active' CHECK (trang_thai IN ('active', 'inactive', 'completed', 'cancelled')),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa TIMESTAMP NULL
);

CREATE TABLE sinh_vien_khoa_hoc (
    id_dang_ky SERIAL PRIMARY KEY,
    id_sinh_vien INT NOT NULL REFERENCES sinh_vien(id_sinh_vien),
    id_khoa_hoc INT NOT NULL REFERENCES khoa_hoc(id_khoa_hoc),
    ngay_dang_ky DATE DEFAULT CURRENT_DATE,
    trang_thai VARCHAR(20) DEFAULT 'registered' CHECK (trang_thai IN ('registered', 'dropped', 'completed')),
    diem_chuyen_can NUMERIC(4,2) CHECK (diem_chuyen_can BETWEEN 0 AND 10),
    diem_giua_ky NUMERIC(4,2) CHECK (diem_giua_ky BETWEEN 0 AND 10),
    diem_cuoi_ky NUMERIC(4,2) CHECK (diem_cuoi_ky BETWEEN 0 AND 10),
    ngay_xoa TIMESTAMP NULL,
    UNIQUE (id_sinh_vien, id_khoa_hoc)
);

-- =============================================
-- CƠ SỞ VẬT CHẤT
-- =============================================

CREATE TABLE toa_nha (
    id_toa_nha SERIAL PRIMARY KEY,
    ten_toa_nha VARCHAR(200) NOT NULL,
    ma_toa_nha VARCHAR(50) NOT NULL UNIQUE,
    dia_chi VARCHAR(500),
    ngay_xoa TIMESTAMP NULL
);

CREATE TABLE phong (
    id_phong SERIAL PRIMARY KEY,
    ma_phong VARCHAR(50) NOT NULL UNIQUE,
    ten_phong VARCHAR(200) NOT NULL,
    suc_chua INT NOT NULL CHECK (suc_chua > 0),
    loai VARCHAR(20) NOT NULL CHECK (loai IN ('giang_duong', 'phong_hoc', 'phong_may', 'phong_thuc_hanh')),
    id_toa_nha INT NOT NULL REFERENCES toa_nha(id_toa_nha),
    ngay_xoa TIMESTAMP NULL
);

CREATE TABLE lich_hoc (
    id_lich_hoc SERIAL PRIMARY KEY,
    id_khoa_hoc INT NOT NULL REFERENCES khoa_hoc(id_khoa_hoc),
    id_ngay INT NOT NULL REFERENCES ngay(id_ngay),
    tiet_bat_dau SMALLINT NOT NULL CHECK (tiet_bat_dau BETWEEN 1 AND 9),
    tiet_ket_thuc SMALLINT NOT NULL CHECK (tiet_ket_thuc BETWEEN 1 AND 9),
    id_phong INT NOT NULL REFERENCES phong(id_phong),
    ngay_xoa TIMESTAMP NULL,
    CHECK (tiet_ket_thuc > tiet_bat_dau),
    CHECK (
        (tiet_bat_dau BETWEEN 1 AND 5 AND tiet_ket_thuc BETWEEN 1 AND 5)
        OR (tiet_bat_dau BETWEEN 6 AND 9 AND tiet_ket_thuc BETWEEN 6 AND 9)
    )
);

CREATE TABLE dat_phong (
    id_dat_phong SERIAL PRIMARY KEY,
    id_phong INT NOT NULL REFERENCES phong(id_phong),
    ngay_dat DATE NOT NULL,
    tiet_bat_dau SMALLINT NOT NULL CHECK (tiet_bat_dau BETWEEN 1 AND 9),
    tiet_ket_thuc SMALLINT NOT NULL CHECK (tiet_ket_thuc BETWEEN 1 AND 9),
    muc_dich VARCHAR(500),
    nguoi_dat INT NOT NULL REFERENCES nguoi_dung(id_nguoi_dung),
    trang_thai VARCHAR(20) DEFAULT 'pending' CHECK (trang_thai IN ('pending', 'approved', 'rejected', 'cancelled')),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa TIMESTAMP NULL,
    CHECK (tiet_ket_thuc > tiet_bat_dau),
    CHECK (
        (tiet_bat_dau BETWEEN 1 AND 5 AND tiet_ket_thuc BETWEEN 1 AND 5)
        OR (tiet_bat_dau BETWEEN 6 AND 9 AND tiet_ket_thuc BETWEEN 6 AND 9)
    )
);

-- =============================================
-- TÀI CHÍNH
-- =============================================

CREATE TABLE hoc_phi (
    id_hoc_phi SERIAL PRIMARY KEY,
    id_sinh_vien INT NOT NULL REFERENCES sinh_vien(id_sinh_vien),
    id_hoc_ky INT NOT NULL REFERENCES hoc_ky(id_hoc_ky),
    so_tien NUMERIC(15,2) NOT NULL CHECK (so_tien >= 0),
    han_dong DATE NOT NULL,
    da_dong BOOLEAN DEFAULT FALSE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa TIMESTAMP NULL,
    UNIQUE (id_sinh_vien, id_hoc_ky)
);

CREATE TABLE thanh_toan (
    id_thanh_toan SERIAL PRIMARY KEY,
    id_hoc_phi INT NOT NULL REFERENCES hoc_phi(id_hoc_phi),
    so_tien NUMERIC(15,2) NOT NULL CHECK (so_tien > 0),
    ngay_thanh_toan DATE NOT NULL,
    phuong_thuc_thanh_toan VARCHAR(50) NOT NULL,
    so_bien_lai VARCHAR(100) NOT NULL UNIQUE,
    trang_thai VARCHAR(20) DEFAULT 'completed' CHECK (trang_thai IN ('pending', 'completed', 'failed', 'refunded')),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- GIAO TIẾP
-- =============================================

CREATE TABLE tai_lieu (
    id_tai_lieu SERIAL PRIMARY KEY,
    id_khoa_hoc INT NOT NULL REFERENCES khoa_hoc(id_khoa_hoc),
    ten_file VARCHAR(500) NOT NULL,
    duong_dan_file VARCHAR(1000) NOT NULL,
    loai_file VARCHAR(20) CHECK (loai_file IN ('pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'jpg', 'jpeg', 'png', 'zip', 'rar')),
    kich_thuoc_file BIGINT CHECK (kich_thuoc_file > 0),
    nguoi_upload INT NOT NULL REFERENCES nguoi_dung(id_nguoi_dung),
    mo_ta VARCHAR(1000),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa TIMESTAMP NULL
);

CREATE TABLE thong_bao (
    id_thong_bao SERIAL PRIMARY KEY,
    id_nguoi_gui INT NOT NULL REFERENCES nguoi_dung(id_nguoi_dung),
    id_nguoi_nhan INT NOT NULL REFERENCES nguoi_dung(id_nguoi_dung),
    loai_thong_bao VARCHAR(50) CHECK (loai_thong_bao IN ('diem_so', 'hoc_phi', 'lich_hoc', 'thong_bao_chung', 'he_thong')),
    tieu_de VARCHAR(500) NOT NULL,
    noi_dung TEXT,
    da_doc BOOLEAN DEFAULT FALSE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa TIMESTAMP NULL
);

-- =============================================
-- LỊCH THI
-- =============================================

CREATE TABLE lich_thi (
    id_lich_thi SERIAL PRIMARY KEY,
    id_khoa_hoc INT NOT NULL REFERENCES khoa_hoc(id_khoa_hoc),
    id_phong INT NOT NULL REFERENCES phong(id_phong),
    id_ngay INT NOT NULL REFERENCES ngay(id_ngay),
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    hinh_thuc_thi VARCHAR(50) NOT NULL CHECK (hinh_thuc_thi IN ('trac_nghiem', 'tu_luan', 'thuc_hanh', 'van_dap')),
    loai_ky_thi VARCHAR(20) DEFAULT 'cuoi_ky' CHECK (loai_ky_thi IN ('giuaky', 'cuoi_ky', 'bo_sung')),
    ghi_chu VARCHAR(500),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xoa TIMESTAMP NULL,
    CHECK (gio_ket_thuc > gio_bat_dau)
);