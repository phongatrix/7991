-- Migration 002: CV 7991 Entities and Constraints

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
    CONSTRAINT fk_questions_doc_page 
        FOREIGN KEY (document_id, page_number) 
        REFERENCES document_pages(document_id, page_number) 
        ON DELETE RESTRICT
);

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
    variants_data       JSONB NOT NULL DEFAULT '[]',
    exam_status         VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (exam_status IN ('draft', 'approved', 'published', 'archived')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS analytics_reports (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id             UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    total_candidates    INTEGER NOT NULL DEFAULT 0,
    average_score       NUMERIC(4,2),
    median_score        NUMERIC(4,2),
    pass_rate           NUMERIC(5,2),
    score_distribution  JSONB NOT NULL DEFAULT '{}',
    cognitive_stats     JSONB NOT NULL DEFAULT '{}',
    item_analysis       JSONB NOT NULL DEFAULT '[]',
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS share_tokens (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id             UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    token               VARCHAR(128) NOT NULL UNIQUE,
    permissions         VARCHAR(50) NOT NULL DEFAULT 'view' CHECK (permissions IN ('view', 'review', 'export')),
    expires_at          TIMESTAMPTZ,
    created_by          UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
