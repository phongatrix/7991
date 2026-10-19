/**
 * CV 7991 – Matrix Service
 * Interfaces with matrix_generator.js, runs validation rules,
 * builds specification tables (bản đặc tả), and manages DB persistence.
 */

'use strict';

const path = require('path');
const db = require('../database/connection');
const logger = require('../utils/logger');
const ValidationService = require('./validationService');
const { MatrixGenerator, MatrixValidator, MatrixFormatter } = require('../../processing/matrix_generator');

class MatrixService {
  /**
   * Generate an exam matrix from a processed SGK document
   */
  async createMatrix(data, userId) {
    const { document_id, exam_type = '45min', tn_ratio = 0.7, distribution, group_by_chapter } = data;
    const lesson_from = parseInt(data.lesson_from || data.chapFrom || data.chapter_from || 0, 10);
    const lesson_to   = parseInt(data.lesson_to   || data.chapTo   || data.chapter_to   || 0, 10);

    // Fetch document structure
    let docRecord = null;
    try {
      const docRes = await db.query(`SELECT * FROM documents WHERE id = $1`, [document_id]);
      docRecord = docRes.rows[0];
    } catch (_) {}

    let structure = docRecord?.structure_json || {
      document_id,
      subject: docRecord?.subject || 'math',
      grade: docRecord?.grade || 10,
      chapters: [
        {
          chapter_number: 1,
          chapter_name: 'Mệnh đề và tập hợp',
          lessons: [
            { lesson_number: 1, lesson_name: 'Mệnh đề', start_page: 5, end_page: 12 },
            { lesson_number: 2, lesson_name: 'Tập hợp', start_page: 13, end_page: 22 },
          ],
        },
      ],
    };

    // Lọc cấu trúc SGK theo đúng dải bài học đã chọn [lesson_from, lesson_to]
    if (lesson_from > 0 || lesson_to > 0) {
      const from = lesson_from > 0 ? lesson_from : 1;
      const to   = lesson_to > 0 ? lesson_to : 999;
      structure = {
        ...structure,
        lesson_from: from,
        lesson_to: to,
        chapters: (structure.chapters || []).map(ch => ({
          ...ch,
          lessons: (ch.lessons || []).filter(l => {
            const num = l.lesson_number || l.lesson || 0;
            return num >= from && num <= to;
          })
        })).filter(ch => (ch.lessons || []).length > 0)
      };
    }

    const generator = new MatrixGenerator({
      examType: exam_type,
      tnRatio: tn_ratio,
      customDistribution: distribution,
      groupByChapter: group_by_chapter,
    });

    const matrix = generator.generateFromDocument(structure);

    // Validate with strict CV 7991 rules
    const validationResult = ValidationService.validateMatrix(matrix);
    matrix.is_valid = validationResult.isValid;
    matrix.validation_details = validationResult;

    // Generate Specification Table (Bản đặc tả)
    matrix.specification_table = this.generateSpecificationTable(matrix, structure);

    // Persist to PostgreSQL
    const matrixId = require('uuid').v4();
    matrix.matrix_id = matrixId;

    const sql = `
      INSERT INTO matrices (
        id, user_id, document_id, title, exam_type, total_questions,
        tn_ratio, is_valid, matrix_data, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
      RETURNING *;
    `;

    try {
      const res = await db.query(sql, [
        matrixId,
        userId,
        document_id,
        data.title || `Ma trận đề thi ${exam_type} - ${structure.subject || 'Toán'}`,
        exam_type,
        matrix.summary?.grand_total || 28,
        tn_ratio,
        matrix.is_valid,
        JSON.stringify(matrix),
      ]);
      return res.rows[0];
    } catch (err) {
      logger.warn(`Failed to insert matrix into DB (${err.message}). Returning memory object.`);
      return {
        id: matrixId,
        user_id: userId,
        document_id,
        exam_type,
        is_valid: matrix.is_valid,
        matrix_data: matrix,
      };
    }
  }

  /**
   * Builds the CV 7991 Specification Table (Bản đặc tả đề kiểm tra)
   */
  generateSpecificationTable(matrix, structure) {
    const rows = [];
    let questionIndex = 1;

    (matrix.topics || []).forEach((topic) => {
      const topicName = topic.topic_name || topic.name || 'Chủ đề';
      const slots = topic.slots || [];

      const nbSlots = slots.filter((s) => s.cognitive_level === 'NB');
      const thSlots = slots.filter((s) => s.cognitive_level === 'TH');
      const vdSlots = slots.filter((s) => s.cognitive_level === 'VD');
      const vdcSlots = slots.filter((s) => s.cognitive_level === 'VDC');

      rows.push({
        topic_name: topicName,
        chapter_name: topic.chapter_name || '',
        page_range: topic.page_range || `${topic.start_page || 1} - ${topic.end_page || 10}`,
        learning_outcomes: topic.learning_objectives || [
          `Nhận biết và vận dụng kiến thức bài học ${topicName}`,
        ],
        NB: {
          count: nbSlots.length,
          question_indices: nbSlots.map(() => questionIndex++),
        },
        TH: {
          count: thSlots.length,
          question_indices: thSlots.map(() => questionIndex++),
        },
        VD: {
          count: vdSlots.length,
          question_indices: vdSlots.map(() => questionIndex++),
        },
        VDC: {
          count: vdcSlots.length,
          question_indices: vdcSlots.map(() => questionIndex++),
        },
      });
    });

    return {
      title: 'BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ THEO CÔNG VĂN 7991/BGDĐT-GDTr',
      generated_at: new Date().toISOString(),
      rows,
    };
  }

  async getMatrixById(matrixId) {
    try {
      const res = await db.query(`SELECT * FROM matrices WHERE id = $1`, [matrixId]);
      return res.rows[0] || null;
    } catch (_) {
      return null;
    }
  }

  async validateExistingMatrix(matrixId) {
    const matrixRec = await this.getMatrixById(matrixId);
    if (!matrixRec) throw new Error('Không tìm thấy ma trận đề thi');

    const matrixData = typeof matrixRec.matrix_data === 'string'
      ? JSON.parse(matrixRec.matrix_data)
      : matrixRec.matrix_data;

    const result = ValidationService.validateMatrix(matrixData);

    try {
      await db.query(`UPDATE matrices SET is_valid = $2, updated_at = NOW() WHERE id = $1`, [
        matrixId,
        result.isValid,
      ]);
    } catch (_) {}

    return result;
  }

  async listMatrices(userId, { limit = 20, offset = 0 } = {}) {
    try {
      const res = await db.query(
        `SELECT id, document_id, title, exam_type, total_questions, tn_ratio, is_valid, created_at 
         FROM matrices WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      const countRes = await db.query(`SELECT COUNT(*) FROM matrices WHERE user_id = $1`, [userId]);
      return {
        matrices: res.rows,
        total: parseInt(countRes.rows[0]?.count || '0', 10),
      };
    } catch (_) {
      return { matrices: [], total: 0 };
    }
  }
}

module.exports = MatrixService;
