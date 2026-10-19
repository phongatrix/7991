-- Migration 001: Initial Schema (Extensions, Users, Curriculum, Documents, Pages)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TABLE IF NOT EXISTS grades (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_level     SMALLINT NOT NULL UNIQUE CHECK (grade_level BETWEEN 1 AND 12),
    name            VARCHAR(50) NOT NULL,
    educational_stage VARCHAR(50) NOT NULL CHECK (educational_stage IN ('primary', 'lower_secondary', 'upper_secondary')),
    curriculum      VARCHAR(100) NOT NULL DEFAULT 'GDPT 2018',
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    department      VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    grade_id        UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES topics(id) ON DELETE CASCADE,
    code            VARCHAR(100),
    title           VARCHAR(300) NOT NULL,
    chapter_number  SMALLINT,
    lesson_number   SMALLINT,
    start_page      INTEGER,
    end_page        INTEGER,
    key_concepts    TEXT[] DEFAULT '{}',
    learning_outcomes JSONB DEFAULT '[]',
    order_index     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
