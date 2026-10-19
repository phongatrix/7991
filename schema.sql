-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  CV 7991 – PostgreSQL Relational Database Schema                ║
-- ║  Hệ thống tạo đề thi chuẩn Công văn 7991/BGDĐT-GDTr (2024)       ║
-- ║  Version: 2.0  |  Database: PostgreSQL 15+                       ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ── Extensions ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ── Custom Domain Constraints & Functions ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════════
-- 1. USERS, GRADES, SUBJECTS, TOPICS
-- ══════════════════════════════════════════════════════════════════

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    school_name     VARCHAR(255),
    department      VARCHAR(255),
    role            VARCHAR(50)  NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher', 'reviewer', 'student')),
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    email_verified  BOOLEAN      NOT NULL DEFAULT false,
    avatar_url      TEXT,
    preferences     JSONB        NOT NULL DEFAULT '{}',
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Grades Table (Lớp 1 đến 12)
CREATE TABLE IF NOT EXISTS grades (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_level     SMALLINT NOT NULL UNIQUE CHECK (grade_level BETWEEN 1 AND 12),
    name            VARCHAR(50) NOT NULL, -- "Lớp 10", "Lớp 11", ...
    educational_stage VARCHAR(50) NOT NULL CHECK (educational_stage IN ('primary', 'lower_secondary', 'upper_secondary')),
    curriculum      VARCHAR(100) NOT NULL DEFAULT 'GDPT 2018',
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subjects Table (Môn học)
CREATE TABLE IF NOT EXISTS subjects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE, -- "math", "physics", "chemistry", ...
    name            VARCHAR(100) NOT NULL,        -- "Toán học", "Vật lí", ...
    department      VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Topics Table (Chủ đề / Bài học phân cấp từ SGK)
CREATE TABLE IF NOT EXISTS topics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    grade_id        UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES topics(id) ON DELETE CASCADE,
    code            VARCHAR(100),                 -- Mã chủ đề (ví dụ: "TOAN10_CH1_B1")
    title           VARCHAR(300) NOT NULL,        -- Tên chủ đề / bài học
    chapter_number  SMALLINT,
    lesson_number   SMALLINT,
    start_page      INTEGER,
    end_page        INTEGER,
    key_concepts    TEXT[] DEFAULT '{}',
    learning_outcomes JSONB DEFAULT '[]',         -- Yêu cầu cần đạt theo chuẩn BGDĐT
    order_index     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- 2. DOCUMENTS (SGK FILES), DOCUMENT PAGES, OCR RESULTS
-- ══════════════════════════════════════════════════════════════════

-- Documents Table (Sách Giáo Khoa / Tài liệu PDF)
CREATE TABLE IF NOT EXISTS documents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id          UUID REFERENCES subjects(id) ON DELETE SET NULL,
    grade_id            UUID REFERENCES grades(id) ON DELETE SET NULL,
    original_filename   VARCHAR(500) NOT NULL,
    file_path           TEXT NOT NULL,
    file_size           BIGINT NOT NULL,
    file_hash           CHAR(64),
    mime_type           VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    ocr_status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'done', 'failed')),
    processed_content   TEXT,
    toc_data            JSONB NOT NULL DEFAULT '{}',
    total_pages         INTEGER DEFAULT 0,
    ocr_engine          VARCHAR(50) DEFAULT 'tesseract',
    error_message       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document Pages Table (Từng trang SGK đã xử lý và nhận diện)
CREATE TABLE IF NOT EXISTS document_pages (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id         UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number         INTEGER NOT NULL CHECK (page_number > 0),
    ocr_text            TEXT,
    header_info         VARCHAR(500),
    footer_info         VARCHAR(500),
    content_sections    JSONB NOT NULL DEFAULT '[]',
    confidence_score    NUMERIC(5,4),
    has_math            BOOLEAN DEFAULT false,
    image_url           TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (document_id, page_number)
);

-- OCR Results Table (Chi tiết các khối nhận diện OCR)
CREATE TABLE IF NOT EXISTS ocr_results (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id         UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_id             UUID REFERENCES document_pages(id) ON DELETE CASCADE,
    engine              VARCHAR(50) NOT NULL DEFAULT 'tesseract',
    raw_text            TEXT NOT NULL,
    blocks              JSONB NOT NULL DEFAULT '[]',
    confidence          NUMERIC(5,4),
    processing_time_ms  INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- 3. EXAM MATRICES & SPECIFICATIONS (CV 7991)
-- ══════════════════════════════════════════════════════════════════

-- Exam Matrices Table (Ma trận đề kiểm tra CV 7991)
CREATE TABLE IF NOT EXISTS exam_matrices (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
    subject_id          UUID REFERENCES subjects(id) ON DELETE SET NULL,
    grade_id            UUID REFERENCES grades(id) ON DELETE SET NULL,
    title               VARCHAR(300) NOT NULL,
    exam_type           VARCHAR(50) NOT NULL DEFAULT '45min' CHECK (exam_type IN ('15min', '45min', '90min', '150min', 'custom')),
    sections            JSONB NOT NULL DEFAULT '[]',
    question_types      JSONB NOT NULL DEFAULT '[]',
    level_distribution  JSONB NOT NULL DEFAULT '{"NB": 0.40, "TH": 0.30, "VD": 0.20, "VDC": 0.10}',
    total_points        NUMERIC(4,2) NOT NULL DEFAULT 10.00 CHECK (total_points = 10.00),
    total_questions     INTEGER NOT NULL DEFAULT 28,
    cv7991_compliant    BOOLEAN NOT NULL DEFAULT true,
    is_valid            BOOLEAN NOT NULL DEFAULT true,
    validation_log      JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Specifications Table (Bản đặc tả đề kiểm tra theo CV 7991)
CREATE TABLE IF NOT EXISTS specifications (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matrix_id               UUID NOT NULL REFERENCES exam_matrices(id) ON DELETE CASCADE,
    title                   VARCHAR(300) NOT NULL,
    requirements            JSONB NOT NULL DEFAULT '{}',
    question_specifications JSONB NOT NULL DEFAULT '[]',
    sgk_alignment           JSONB NOT NULL DEFAULT '{}',
    total_learning_outcomes INTEGER DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- 4. QUESTION BANKS & QUESTIONS
-- ══════════════════════════════════════════════════════════════

-- Question Banks Table
CREATE TABLE IF NOT EXISTS question_banks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id      UUID REFERENCES subjects(id) ON DELETE SET NULL,
    grade_id        UUID REFERENCES grades(id) ON DELETE SET NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    is_public       BOOLEAN NOT NULL DEFAULT false,
    question_count  INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions Table (Liên kết chặt chẽ với SGK qua document_id và page_number)
CREATE TABLE IF NOT EXISTS questions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_id             UUID REFERENCES question_banks(id) ON DELETE SET NULL,
    matrix_id           UUID REFERENCES exam_matrices(id) ON DELETE SET NULL,
    topic_id            UUID REFERENCES topics(id) ON DELETE SET NULL,
    document_id         UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
    page_number         INTEGER NOT NULL,
    sgk_page_reference  INTEGER NOT NULL,
    part_number         SMALLINT NOT NULL DEFAULT 1 CHECK (part_number BETWEEN 1 AND 4),
    content             TEXT NOT NULL,
    options             JSONB NOT NULL DEFAULT '[]',
    correct_answer      VARCHAR(255) NOT NULL,
    explanation         TEXT,
    cognitive_level     VARCHAR(10) NOT NULL CHECK (cognitive_level IN ('NB', 'TH', 'VD', 'VDC')),
    question_type       VARCHAR(50) NOT NULL CHECK (question_type IN ('TN_4_CHOICE', 'TN_TRUE_FALSE', 'TN_SHORT_ANSWER', 'ESSAY')),
    points              NUMERIC(4,2) NOT NULL DEFAULT 0.25 CHECK (points > 0),
    difficulty_score    NUMERIC(3,2) DEFAULT 0.50,
    textbook_excerpt    VARCHAR(500) CHECK (char_length(textbook_excerpt) <= 500),
    content_similarity  FLOAT DEFAULT 0.0 CHECK (content_similarity >= 0.0 AND content_similarity <= 1.0),
    metadata            JSONB NOT NULL DEFAULT '{}',
    is_verified         BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Foreign Key liên kết trang SGK
    CONSTRAINT fk_questions_doc_page 
        FOREIGN KEY (document_id, page_number) 
        REFERENCES document_pages(document_id, page_number) 
        ON DELETE RESTRICT
);

-- ══════════════════════════════════════════════════════════════════
-- 5. EXAMS, EXAM RESULTS, ANALYTICS REPORTS
-- ══════════════════════════════════════════════════════════════

-- Exams Table (Đề thi hoàn chỉnh kèm các mã đề 101, 102, 103, 104)
CREATE TABLE IF NOT EXISTS exams (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matrix_id           UUID NOT NULL REFERENCES exam_matrices(id) ON DELETE RESTRICT,
    title               VARCHAR(300) NOT NULL,
    school_name         VARCHAR(255) DEFAULT 'SỞ GIÁO DỤC VÀ ĐÀO TẠO',
    academic_year       VARCHAR(50) DEFAULT '2024 - 2025',
    duration_minutes    INTEGER NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
    total_score         NUMERIC(4,2) NOT NULL DEFAULT 10.00 CHECK (total_score = 10.00),
    total_questions     INTEGER NOT NULL,
    variants_data       JSONB NOT NULL DEFAULT '[]', -- Chứa danh sách các mã đề và bảng đáp án
    exam_status         VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (exam_status IN ('draft', 'approved', 'published', 'archived')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam Results Table (Kết quả thi của thí sinh)
CREATE TABLE IF NOT EXISTS exam_results (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id             UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_name        VARCHAR(255) NOT NULL,
    student_code        VARCHAR(50),
    class_name          VARCHAR(50),
    variant_code        INTEGER NOT NULL,
    submitted_answers   JSONB NOT NULL DEFAULT '{}',
    score_part1         NUMERIC(4,2) DEFAULT 0.00,
    score_part2         NUMERIC(4,2) DEFAULT 0.00,
    score_part3         NUMERIC(4,2) DEFAULT 0.00,
    score_part4         NUMERIC(4,2) DEFAULT 0.00,
    total_score         NUMERIC(4,2) NOT NULL CHECK (total_score BETWEEN 0.00 AND 10.00),
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics Reports Table (Báo cáo phân tích chất lượng đề thi & phổ điểm)
CREATE TABLE IF NOT EXISTS analytics_reports (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id             UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    total_candidates    INTEGER NOT NULL DEFAULT 0,
    average_score       NUMERIC(4,2),
    median_score        NUMERIC(4,2),
    pass_rate           NUMERIC(5,2),
    score_distribution  JSONB NOT NULL DEFAULT '{}',
    cognitive_stats     JSONB NOT NULL DEFAULT '{}',
    item_analysis       JSONB NOT NULL DEFAULT '[]', -- Độ khó và độ phân biệt từng câu
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- 6. AI PROVIDERS, BATCH JOBS, SHARE TOKENS
-- ══════════════════════════════════════════════════════════════

-- AI Providers Table (Cấu hình & Quota các mô hình LLM)
CREATE TABLE IF NOT EXISTS ai_providers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name       VARCHAR(50) NOT NULL UNIQUE CHECK (provider_name IN ('gemini', 'openai', 'claude', 'mock')),
    model_name          VARCHAR(100) NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    priority            INTEGER NOT NULL DEFAULT 1,
    rate_limit_rpm      INTEGER NOT NULL DEFAULT 60,
    quota_monthly       BIGINT NOT NULL DEFAULT 1000000,
    quota_used          BIGINT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Batch Jobs Table (Tiến trình ngầm: OCR, sinh ma trận, tạo câu hỏi tự động)
CREATE TABLE IF NOT EXISTS batch_jobs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_type            VARCHAR(50) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    progress_percent    INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    payload             JSONB NOT NULL DEFAULT '{}',
    result              JSONB,
    error_message       TEXT,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Share Tokens Table (Chia sẻ đề thi và ma trận an toàn)
CREATE TABLE IF NOT EXISTS share_tokens (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id             UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    token               VARCHAR(128) NOT NULL UNIQUE,
    permissions         VARCHAR(50) NOT NULL DEFAULT 'view' CHECK (permissions IN ('view', 'review', 'export')),
    expires_at          TIMESTAMPTZ,
    created_by          UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Triggers Cập Nhật updated_at ──────────────────────────────────
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_topics_updated_at ON topics;
CREATE TRIGGER trg_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_matrices_updated_at ON exam_matrices;
CREATE TRIGGER trg_matrices_updated_at BEFORE UPDATE ON exam_matrices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_questions_updated_at ON questions;
CREATE TRIGGER trg_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_exams_updated_at ON exams;
CREATE TRIGGER trg_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
