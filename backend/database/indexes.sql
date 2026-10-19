-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  CV 7991 – Performance Indexes (indexes.sql)                     ║
-- ║  Tối ưu hóa truy vấn tìm kiếm, toàn văn (Full-Text), và thống kê ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ══════════════════════════════════════════════════════════════════
-- 1. QUESTIONS SEARCH INDEXES
-- Hỗ trợ lọc theo topic, difficulty, cognitive level, textbook_page, và full-text search
-- ══════════════════════════════════════════════════════════════════

-- B-Tree index cho việc lọc phân loại câu hỏi
CREATE INDEX IF NOT EXISTS idx_questions_topic_id 
    ON questions(topic_id);

CREATE INDEX IF NOT EXISTS idx_questions_cognitive_level 
    ON questions(cognitive_level);

CREATE INDEX IF NOT EXISTS idx_questions_question_type 
    ON questions(question_type);

CREATE INDEX IF NOT EXISTS idx_questions_difficulty 
    ON questions(difficulty_score);

CREATE INDEX IF NOT EXISTS idx_questions_sgk_page 
    ON questions(sgk_page_reference);

CREATE INDEX IF NOT EXISTS idx_questions_doc_page 
    ON questions(document_id, page_number);

-- Composite index tối ưu cho thuật toán khớp ma trận CV 7991 (Level + Type + Topic)
CREATE INDEX IF NOT EXISTS idx_questions_matrix_matcher 
    ON questions(cognitive_level, question_type, topic_id);

-- GIN Trigram index tìm kiếm nội dung câu hỏi tiếng Việt
CREATE INDEX IF NOT EXISTS idx_questions_content_trgm 
    ON questions USING gin (content gin_trgm_ops);

-- GIN Full-Text Search index cho câu hỏi
CREATE INDEX IF NOT EXISTS idx_questions_content_fts 
    ON questions USING gin (to_tsvector('simple', content));

-- GIN index cho metadata câu hỏi
CREATE INDEX IF NOT EXISTS idx_questions_metadata_gin 
    ON questions USING gin (metadata);


-- ══════════════════════════════════════════════════════════════════
-- 2. EXAM MATRICES LOOKUP INDEXES
-- Tối ưu tìm kiếm ma trận theo người dùng, tài liệu gốc, môn học và chuẩn CV 7991
-- ══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_matrices_user_id 
    ON exam_matrices(user_id);

CREATE INDEX IF NOT EXISTS idx_matrices_source_document 
    ON exam_matrices(source_document_id);

CREATE INDEX IF NOT EXISTS idx_matrices_subject_grade 
    ON exam_matrices(subject_id, grade_id);

CREATE INDEX IF NOT EXISTS idx_matrices_exam_type 
    ON exam_matrices(exam_type);

CREATE INDEX IF NOT EXISTS idx_matrices_cv7991_compliant 
    ON exam_matrices(cv7991_compliant) WHERE cv7991_compliant = true;

CREATE INDEX IF NOT EXISTS idx_matrices_created_at 
    ON exam_matrices(created_at DESC);

-- GIN index cho các phân vùng sections và level_distribution
CREATE INDEX IF NOT EXISTS idx_matrices_sections_gin 
    ON exam_matrices USING gin (sections);


-- ══════════════════════════════════════════════════════════════════
-- 3. EXAM RESULTS & ANALYTICS INDEXES
-- Tối ưu báo cáo phổ điểm và phân tích năng lực thí sinh
-- ══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id 
    ON exam_results(exam_id);

CREATE INDEX IF NOT EXISTS idx_exam_results_variant 
    ON exam_results(exam_id, variant_code);

CREATE INDEX IF NOT EXISTS idx_exam_results_total_score 
    ON exam_results(total_score);

CREATE INDEX IF NOT EXISTS idx_exam_results_student 
    ON exam_results(student_code);

CREATE INDEX IF NOT EXISTS idx_exam_results_submitted_at 
    ON exam_results(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_exam_id 
    ON analytics_reports(exam_id);


-- ══════════════════════════════════════════════════════════════════
-- 4. DOCUMENT CONTENT SEARCH INDEXES (Processed OCR Full-Text)
-- Tìm kiếm toàn văn trên nội dung SGK đã qua nhận diện
-- ══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_documents_user_id 
    ON documents(user_id);

CREATE INDEX IF NOT EXISTS idx_documents_ocr_status 
    ON documents(ocr_status);

CREATE INDEX IF NOT EXISTS idx_documents_file_hash 
    ON documents(file_hash);

-- GIN Full-Text Search trên toàn bộ nội dung tài liệu SGK
CREATE INDEX IF NOT EXISTS idx_documents_processed_content_fts 
    ON documents USING gin (to_tsvector('simple', COALESCE(processed_content, '')));

-- GIN Trigram index trên tên file gốc
CREATE INDEX IF NOT EXISTS idx_documents_filename_trgm 
    ON documents USING gin (original_filename gin_trgm_ops);

-- GIN index cấu trúc mục lục TOC
CREATE INDEX IF NOT EXISTS idx_documents_toc_gin 
    ON documents USING gin (toc_data);


-- ══════════════════════════════════════════════════════════════════
-- 5. DOCUMENT PAGES LOOKUP INDEXES
-- Tra cứu cực nhanh từng trang SGK theo (document_id, page_number)
-- ══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_document_pages_lookup 
    ON document_pages(document_id, page_number);

-- GIN Full-Text Search trên từng trang sách
CREATE INDEX IF NOT EXISTS idx_document_pages_ocr_text_fts 
    ON document_pages USING gin (to_tsvector('simple', COALESCE(ocr_text, '')));

-- B-Tree index lọc trang có chứa công thức toán
CREATE INDEX IF NOT EXISTS idx_document_pages_has_math 
    ON document_pages(document_id, has_math) WHERE has_math = true;

-- GIN index cho các khối nội dung trích xuất
CREATE INDEX IF NOT EXISTS idx_document_pages_sections_gin 
    ON document_pages USING gin (content_sections);

-- OCR Results indexes
CREATE INDEX IF NOT EXISTS idx_ocr_results_page 
    ON ocr_results(page_id);

CREATE INDEX IF NOT EXISTS idx_ocr_results_doc 
    ON ocr_results(document_id);


-- ══════════════════════════════════════════════════════════════════
-- 6. MISCELLANEOUS (Batch jobs, Share tokens, Topics)
-- ══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_batch_jobs_user_status 
    ON batch_jobs(user_id, status);

CREATE INDEX IF NOT EXISTS idx_share_tokens_lookup 
    ON share_tokens(token);

CREATE INDEX IF NOT EXISTS idx_topics_parent_order 
    ON topics(parent_id, order_index);

CREATE INDEX IF NOT EXISTS idx_topics_subject_grade 
    ON topics(subject_id, grade_id);
