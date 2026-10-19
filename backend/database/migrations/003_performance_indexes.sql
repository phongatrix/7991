-- Migration 003: Performance Indexes

-- 1. Questions
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_cognitive_level ON questions(cognitive_level);
CREATE INDEX IF NOT EXISTS idx_questions_question_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_score);
CREATE INDEX IF NOT EXISTS idx_questions_sgk_page ON questions(sgk_page_reference);
CREATE INDEX IF NOT EXISTS idx_questions_doc_page ON questions(document_id, page_number);
CREATE INDEX IF NOT EXISTS idx_questions_matrix_matcher ON questions(cognitive_level, question_type, topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_content_trgm ON questions USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_questions_content_fts ON questions USING gin (to_tsvector('simple', content));
CREATE INDEX IF NOT EXISTS idx_questions_metadata_gin ON questions USING gin (metadata);

-- 2. Exam Matrices
CREATE INDEX IF NOT EXISTS idx_matrices_user_id ON exam_matrices(user_id);
CREATE INDEX IF NOT EXISTS idx_matrices_source_document ON exam_matrices(source_document_id);
CREATE INDEX IF NOT EXISTS idx_matrices_subject_grade ON exam_matrices(subject_id, grade_id);
CREATE INDEX IF NOT EXISTS idx_matrices_exam_type ON exam_matrices(exam_type);
CREATE INDEX IF NOT EXISTS idx_matrices_cv7991_compliant ON exam_matrices(cv7991_compliant) WHERE cv7991_compliant = true;
CREATE INDEX IF NOT EXISTS idx_matrices_created_at ON exam_matrices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matrices_sections_gin ON exam_matrices USING gin (sections);

-- 3. Exam Results & Analytics
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_variant ON exam_results(exam_id, variant_code);
CREATE INDEX IF NOT EXISTS idx_exam_results_total_score ON exam_results(total_score);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_code);
CREATE INDEX IF NOT EXISTS idx_exam_results_submitted_at ON exam_results(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_exam_id ON analytics_reports(exam_id);

-- 4. Documents Full-Text
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_ocr_status ON documents(ocr_status);
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);
CREATE INDEX IF NOT EXISTS idx_documents_processed_content_fts ON documents USING gin (to_tsvector('simple', COALESCE(processed_content, '')));
CREATE INDEX IF NOT EXISTS idx_documents_filename_trgm ON documents USING gin (original_filename gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_documents_toc_gin ON documents USING gin (toc_data);

-- 5. Document Pages
CREATE INDEX IF NOT EXISTS idx_document_pages_lookup ON document_pages(document_id, page_number);
CREATE INDEX IF NOT EXISTS idx_document_pages_ocr_text_fts ON document_pages USING gin (to_tsvector('simple', COALESCE(ocr_text, '')));
CREATE INDEX IF NOT EXISTS idx_document_pages_has_math ON document_pages(document_id, has_math) WHERE has_math = true;
CREATE INDEX IF NOT EXISTS idx_document_pages_sections_gin ON document_pages USING gin (content_sections);

-- 6. Batch & Share
CREATE INDEX IF NOT EXISTS idx_batch_jobs_user_status ON batch_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_share_tokens_lookup ON share_tokens(token);
CREATE INDEX IF NOT EXISTS idx_topics_parent_order ON topics(parent_id, order_index);
CREATE INDEX IF NOT EXISTS idx_topics_subject_grade ON topics(subject_id, grade_id);
