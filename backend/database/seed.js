/**
 * CV 7991 – Database Seed Script
 * Populates system with initial users, sample curriculum documents,
 * pre-validated CV 7991 matrices, and question bank samples.
 * Run: npm run seed
 */

'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const logger = require('../utils/logger');

async function runSeed() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'cv7991',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  logger.info('Starting CV 7991 database seeding...');

  try {
    const client = await pool.connect();

    // 1. Seed Users (Admin & Teacher)
    const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
    const teacherPasswordHash = await bcrypt.hash('Teacher@123456', 10);

    const adminId = '11111111-1111-1111-1111-111111111111';
    const teacherId = '22222222-2222-2222-2222-222222222222';

    await client.query(`
      INSERT INTO users (id, email, password_hash, full_name, school_name, department, role, is_active, email_verified)
      VALUES 
        ($1, 'admin@cv7991.edu.vn', $2, 'Quản Trị Viên CV 7991', 'Bộ Giáo Dục và Đào Tạo', 'Cục Quản Lý Chất Lượng', 'admin', true, true),
        ($3, 'giaovien@cv7991.edu.vn', $4, 'Thầy Nguyễn Văn An', 'THPT Chuyên Chuẩn', 'Tổ Toán - Tin', 'teacher', true, true)
      ON CONFLICT (email) DO NOTHING;
    `, [adminId, adminPasswordHash, teacherId, teacherPasswordHash]);

    logger.info('✅ Seeded users (admin@cv7991.edu.vn / giaovien@cv7991.edu.vn)');

    // 2. Seed Document (SGK Toán 10)
    const docId = '33333333-3333-3333-3333-333333333333';
    const sampleStructure = {
      title: 'Sách giáo khoa Toán 10 - Tập 1 (Kết nối tri thức)',
      subject: 'math',
      grade: 10,
      total_pages: 112,
      chapters: [
        {
          chapter_number: 1,
          chapter_name: 'Mệnh đề và tập hợp',
          start_page: 5,
          end_page: 30,
          lessons: [
            { lesson_number: 1, lesson_name: 'Mệnh đề', start_page: 5, end_page: 14, key_concepts: ['Mệnh đề', 'Phủ định'] },
            { lesson_number: 2, lesson_name: 'Tập hợp và các phép toán trên tập hợp', start_page: 15, end_page: 30, key_concepts: ['Tập hợp', 'Giao', 'Hợp'] },
          ],
        },
        {
          chapter_number: 2,
          chapter_name: 'Bất phương trình và hệ bất phương trình bậc nhất hai ẩn',
          start_page: 31,
          end_page: 50,
          lessons: [
            { lesson_number: 3, lesson_name: 'Bất phương trình bậc nhất hai ẩn', start_page: 31, end_page: 40, key_concepts: ['Nửa mặt phẳng', 'Miền nghiệm'] },
            { lesson_number: 4, lesson_name: 'Hệ bất phương trình bậc nhất hai ẩn', start_page: 41, end_page: 50, key_concepts: ['Hệ BPT', 'Tối ưu'] },
          ],
        },
      ],
    };

    await client.query(`
      INSERT INTO documents (
        id, user_id, file_name, file_path, file_size, file_hash, mime_type,
        subject, grade, status, total_pages, chapter_count, lesson_count, structure_json
      ) VALUES (
        $1, $2, 'SGK_Toan_10_Tap_1.pdf', '/uploads/documents/SGK_Toan_10_Tap_1.pdf',
        10485760, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'application/pdf', 'math', 10, 'processed', 112, 2, 4, $3
      )
      ON CONFLICT (id) DO NOTHING;
    `, [docId, teacherId, JSON.stringify(sampleStructure)]);

    logger.info('✅ Seeded sample SGK document (SGK_Toan_10_Tap_1.pdf)');

    // 3. Seed Standard CV 7991 Matrix
    const matrixId = '44444444-4444-4444-4444-444444444444';
    const sampleMatrix = {
      matrix_id: matrixId,
      exam_type: '45min',
      is_valid: true,
      summary: { grand_total: 28, total_score: 10.0 },
      topics: [
        {
          topic_name: 'Mệnh đề',
          slots: [
            { slot_id: 'm1_s1', cognitive_level: 'NB', question_type: 'TN', score: 0.25, sgk_page_start: 5, sgk_page_end: 10 },
            { slot_id: 'm1_s2', cognitive_level: 'TH', question_type: 'TN', score: 0.25, sgk_page_start: 5, sgk_page_end: 14 },
          ],
        },
        {
          topic_name: 'Tập hợp và các phép toán trên tập hợp',
          slots: [
            { slot_id: 'm1_s3', cognitive_level: 'NB', question_type: 'TN', score: 0.25, sgk_page_start: 15, sgk_page_end: 20 },
            { slot_id: 'm1_s4', cognitive_level: 'VD', question_type: 'TN', score: 0.25, sgk_page_start: 21, sgk_page_end: 30 },
          ],
        },
      ],
    };

    await client.query(`
      INSERT INTO matrices (
        id, user_id, document_id, title, exam_type, total_questions, tn_ratio, is_valid, matrix_data
      ) VALUES (
        $1, $2, $3, 'Ma trận kiểm tra định kỳ 45 phút môn Toán 10 (CV 7991)', '45min', 28, 0.7, true, $4
      )
      ON CONFLICT (id) DO NOTHING;
    `, [matrixId, teacherId, docId, JSON.stringify(sampleMatrix)]);

    logger.info('✅ Seeded CV 7991 exam matrix');

    // 4. Seed Questions
    await client.query(`
      INSERT INTO questions (
        id, matrix_id, question_text, question_type, cognitive_level, options, correct_answer, explanation, score, sgk_page_start, sgk_page_end
      ) VALUES 
        (
          '55555555-5555-5555-5555-555555555551',
          $1,
          'Câu 1: Câu nào sau đây KHÔNG PHẢI là một mệnh đề toán học?',
          'TN',
          'NB',
          '[{"key":"A","text":"15 là số nguyên tố."},{"key":"B","text":"Tam giác đều có ba cạnh bằng nhau."},{"key":"C","text":"Hôm nay trời đẹp quá!"},{"key":"D","text":"4 + 5 = 10."}]'::jsonb,
          'C',
          'Câu cảm thán "Hôm nay trời đẹp quá!" không thể xác định được tính đúng/sai nên không phải là mệnh đề.',
          0.25, 5, 8
        ),
        (
          '55555555-5555-5555-5555-555555555552',
          $1,
          'Câu 2: Cho tập hợp $A = \\{1; 2; 3\\}$ và $B = \\{2; 3; 4; 5\\}$. Giao của hai tập hợp $A \\cap B$ là:',
          'TN',
          'NB',
          '[{"key":"A","text":"{2; 3}"},{"key":"B","text":"{1; 2; 3; 4; 5}"},{"key":"C","text":"{1}"},{"key":"D","text":"{4; 5}"}]'::jsonb,
          'A',
          'Phần tử chung của tập A và tập B là 2 và 3.',
          0.25, 15, 20
        )
      ON CONFLICT (id) DO NOTHING;
    `, [matrixId]);

    logger.info('✅ Seeded sample questions for CV 7991 question bank');

    client.release();
    await pool.end();
    logger.info('🎉 Database seeding completed successfully!');
  } catch (err) {
    logger.warn('Seed encountered warning/offline DB:', err.message);
    await pool.end();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
